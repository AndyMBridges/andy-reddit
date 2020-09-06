import { NextPage } from 'next'
import { Formik, Form } from 'formik'
import { toErrorMap } from '../../utils/toErrorMap'
import InputField from '../../components/InputField'
import { Button, Box, Link, Flex } from '@chakra-ui/core'
import { Wrapper } from '../../components/Wrapper'
import { useChangePasswordMutation } from '../../generated/graphql'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import NextLink from 'next/link'

const ChangePassword: NextPage = () => {
    const router = useRouter()
    console.log(router.query)
    const [, changePassword] = useChangePasswordMutation()
    const [tokenError, setTokenError] = useState('')
    return (
        <Wrapper variant='small'>
            <Formik
            initialValues={{ newPassword: '' }}
            onSubmit={async (values, {setErrors}) => {
                const response = await changePassword({
                    newPassword: values.newPassword,
                    token: typeof router.query.token === "string" ? router.query.token : ""
                })
                if (response.data?.changePassword.errors) {
                    const errorMap = toErrorMap(response.data.changePassword.errors)
                    if ('token' in errorMap) {
                        setTokenError(errorMap.token)
                    } else {
                        setErrors(errorMap)
                    }
                } else if (response.data?.changePassword.user) {
                    // Worked
                    router.push('/')
                }
            }}
        >
            {({ isSubmitting }) => (
                <Form>
                    <InputField
                        name="newPassword"
                        placeholder="New password" 
                        label="New password"
                        type="password"
                    />
                    {tokenError &&
                        <Flex>
                            <Box mr={2} style={{ color: 'red' }}>
                            { tokenError }
                            </Box>
                            <NextLink href="/forgot-password">
                                <Link>Get a new token here</Link>
                            </NextLink>
                        </Flex>
                    }
                    <Button
                        mt={4}
                        isLoading={isSubmitting}
                        variantColor="teal"
                        type="submit"
                    >
                        Change password
                    </Button>
                </Form>
            )}
        </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword)
