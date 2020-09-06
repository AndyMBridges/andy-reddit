import React, { useEffect } from 'react'
import { Formik, Form } from 'formik'
import InputField from '../components/InputField'
import { Box, Button } from '@chakra-ui/core'
import { useCreatePostMutation } from '../generated/graphql'
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'
import Layout from '../components/Layout'
import { useIsAuth } from '../utils/useIsAuth'

export const CreatePost: React.FC<{}> = ({}) => {
    const router = useRouter()
    useIsAuth()
    const [, createPost] = useCreatePostMutation()
    return (
        <Layout variant='small'>
            <Formik
            initialValues={{ title: '', text: ''}}
            onSubmit={async (values) => {
                const { error } = await createPost({ input: values })
                console.log('error ', error)
                if (!error) {
                    router.push('/')
                }
            }}
        >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="title"
                            placeholder="title" 
                            label="title"
                        />
                        <Box mt={4}>
                            <InputField
                                textarea
                                name="text" 
                                placeholder="text..."
                                label="body"
                            />
                        </Box>
                        <Button
                            mt={4}
                            isLoading={isSubmitting}
                            variantColor="teal"
                            type="submit"
                        >
                             Create Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient)(CreatePost)