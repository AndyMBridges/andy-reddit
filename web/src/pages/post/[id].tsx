import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import Layout from '../../components/Layout'
import { Box, Heading } from '@chakra-ui/core'
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl'
import EditDeletePostButtons from '../../components/EditDeletePostButtons'



export const Post = () => {
    const [{data, error, fetching}] = useGetPostFromUrl()

    if (error) {
        return <div>{error.message}</div>
    }

    if (fetching) {
        return (
            <Layout>
                <Box>Loading...</Box>
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

    const { title, text, id, creator } = data?.post

    return (
        <Layout>
            <Heading mb={4}>{title}</Heading>
            <Box mb={4}>{text}</Box>
            <EditDeletePostButtons id={id} creatorId={creator.id} />
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)