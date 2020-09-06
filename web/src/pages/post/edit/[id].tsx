import React from 'react'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../../../utils/createUrqlClient'
import Layout from '../../../components/Layout'
import { Formik, Form } from 'formik'
import InputField from '../../../components/InputField'
import { Box, Button } from '@chakra-ui/core'
import { useUpdatePostMutation, usePostQuery } from '../../../generated/graphql'
import { useRouter } from 'next/router'
import { useGetIntId } from '../../../utils/useGetIntId'

const EditPost = ({}) => {

    const router = useRouter()
    const intId = useGetIntId() 
    const [{data, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    })
    const [, updatePost] = useUpdatePostMutation()

    if (fetching) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        )
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>Post does not exist</Box>
            </Layout>
        )
    }

    return (
        <Layout variant='small'>
            <Formik
            initialValues={{ title: data.post.title, text: data.post.text}}
            onSubmit={async values => {
                await updatePost({
                    id: intId,
                    ...values
                })

                router.back()
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
                             Update Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient)(EditPost)