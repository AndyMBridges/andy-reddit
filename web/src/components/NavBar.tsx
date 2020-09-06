import React from 'react'
import{ Box, Link, Flex, Button, Heading} from "@chakra-ui/core"
import NextLink from 'next/link'
import { useMeQuery, useLogoutMutation } from '../generated/graphql'
import { isServer } from '../utils/isServer'
import { useRouter } from 'next/router'

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter()
    const [{fetching: logoutFetching},logout] = useLogoutMutation()
    const [{data, fetching}] = useMeQuery({
        pause: isServer()
    })

    let body = null
    
    // Data is loading
    if (fetching) {

    // User not logged in
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link color='white' mr={2}>Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link color='white'>Register</Link>
                </NextLink>
            </>
        )
    // User is logged in
    } else {
        body = (
            <Flex>
                <Flex maxW={800} align="center">
                    <NextLink href="/create-post">
                        <Button as={Link} backgroundColor="white" mr={4}>Create Post</Button>
                    </NextLink>
                    <Box color='white' mr={2}>{data.me.username}</Box>
                    <Button
                        onClick={async () => {
                            await logout()
                            router.reload()
                        }}
                        isLoading={logoutFetching}
                        color='white'
                        variant='link'
                    >
                        Logout
                    </Button>
                </Flex>
            </Flex>
        )
    }

    return (
        <Flex zIndex={1} position="sticky" top="0" bg='gray.900' p={4}>
            <Flex flex={1} margin="auto" maxW={800} align="center">
                <NextLink href="/">
                    <Link color='white'>
                        <Heading>Reddit</Heading>
                    </Link>
                </NextLink>
                <Box ml={'auto'}>
                    {body}
                </Box>
            </Flex>
        </Flex>
    )   
}

export default NavBar