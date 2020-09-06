import { Box, IconButton, Link } from "@chakra-ui/core"
import NextLink from 'next/link'
import { useDeletePostMutation, useMeQuery } from "../generated/graphql"

interface EditDeletePostButtonsProps {
    id: number
    creatorId: number
}
const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
    id,
    creatorId
}) => {
    const [{ data: meData }] = useMeQuery()
    const [, deletePost] = useDeletePostMutation()

    if (meData?.me?.id !== creatorId) {
        return null
    }


    return (
        <Box>
            <NextLink
                href="/post/edit/[id]"
                as={`/post/edit/${id}`}
            >
                <IconButton
                    as={Link}
                    mr={4}
                    icon='edit'
                    aria-label="Edit Post"
                    onClick={() => console.log('edit')}
                />
            </NextLink>
            <IconButton
                variantColor="red"
                ml="auto"
                icon='delete'
                aria-label="Detele Post"
                onClick={() => deletePost({ id })}
            />
        </Box>
    )
}

export default EditDeletePostButtons