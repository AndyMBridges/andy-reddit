import { NextPage } from 'next'
import { Wrapper } from '../components/Wrapper'
import { Formik, Form } from 'formik'
import InputField from '../components/InputField'
import { Box, Button } from '@chakra-ui/core'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { useForgotPasswordMutation } from '../generated/graphql'
import { useState } from 'react'

const forgotPassword: NextPage<{}> = () => {
    const [complete, setComplete] = useState(false)
    const [, forgotPassword] = useForgotPasswordMutation()
    return (
        <Wrapper variant='small'>
        <Formik
            initialValues={{ email: ''}}
            onSubmit={async (values) => {
                await forgotPassword(values)
                setComplete(true)
            }}
        >
            {({ isSubmitting }) => complete ? <Box>If an account with that email exists, we've sent you an email</Box> : (
                <Form>
                    <Box mt={4}>
                        <InputField
                            name="email" 
                            placeholder="email"
                            label="email"
                            type="email"
                        />
                    </Box>
                    <Button
                        mt={4}
                        isLoading={isSubmitting}
                        variantColor="teal"
                        type="submit"
                    >
                        Forgot Password
                    </Button>
                </Form>
            )}
        </Formik>
    </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(forgotPassword)