import { Resolver, Mutation, Field, Arg, Ctx, ObjectType, Query, FieldResolver, Root } from "type-graphql"
import { MyContext } from "../types"
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants'
import { User } from "../entities/User"
import argon2 from 'argon2'
import { sendEmail } from "../utils/sendEmail"
import { UsernamePasswordInput } from "./UsernamePasswordInput"
import { validateRegister } from "../utils/validateRegister"
import { v4 } from 'uuid'
import { getConnection } from "typeorm"

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string 
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver(User)
export class UserResolver {

    @FieldResolver(() => String)
    email(
        @Root() user: User,
        @Ctx() {req}: MyContext
    ) {
        // This is the current user and it's ok to show them thier own email
        if (req.session.userId === user.id) {
            return user.email
        }
        // Current user want's to see someone else email
        return ''
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {redis, req}: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: 'Length must be greater than 2'
                    }                   
                ]
            }
        }

        const key = FORGET_PASSWORD_PREFIX + token
        const userId = await redis.get(key)
        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'token expired'
                    }
                ]
            }
        }

        const userIdNum = parseInt(userId)
        const user = await User.findOne(userIdNum)

        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'user no longer exists'
                    }
                ]
            }
        }

        await User.update(
            { id: userIdNum }, 
            {
                password: await argon2.hash(newPassword)
            }
        )

        // Log in user after change password
        req.session.userId = user.id

        redis.del(key)

        return { user }

    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: email })
        if (!user) {
            // The email is not in the DB
            return true
        }

        const token = v4()

        await redis.set(FORGET_PASSWORD_PREFIX + token,  user.id, 'ex', 1000 * 60 * 60 * 24 * 3) // 3 days

        await sendEmail(
            email,
            `<a href="${process.env.CORS_ORIGIN}/change-password/${token}">Reset Password</a>`)

        return true
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req }: MyContext
    ) {
        console.log('session: ', req.session)
        // You are not logged in
        if (!req.session.userId) {
            return null
        }

        return await User.findOne(req.session.userId)
    }
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {req}: MyContext
    ): Promise<UserResponse> {

        const errors = validateRegister(options)
        if (errors) {
            return { errors }
        }

        const hashedPassword = await argon2.hash(options.password)
        let user
        try {
            // User.create({}).save()
            const result = await getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(
                {
                    username: options.username,
                    password: hashedPassword,
                    email: options.email, 
                }    
            )
            .returning('*')
            .execute()
            user = result.raw[0]
        } catch (err) {
            // Duplicate user error
            if (err.code === '23505') {
                return {
                    errors: [{
                        field: 'username',
                        message: 'Username already taken'
                    }]
                }
            }
        }

        // Store user id session
        // Set cookie on user
        // Keep logged in
        req.session.userId = user.id

        return { user }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() {req}: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(
            usernameOrEmail.includes('@')
            ? { where: { email: usernameOrEmail } }
            : { where: { username: usernameOrEmail } })
        if (!user) {
            return {
                errors: [{
                    field: 'usernameOrEmail',
                    message: "That username doesn't exist"
                }]
            }
        }
        const valid = await argon2.verify(user.password, password)
        if (!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: "Incorrect password"
                }]
            } 
        }

        // Store user Id
        req.session.userId = user.id

        return {
            user
        }
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        return new Promise(resolve => req.session.destroy(err => {
            res.clearCookie(COOKIE_NAME)
            if (err) {
                console.log(err)
                resolve(false)
                return
            }

            resolve(true)
        }))
    }
}