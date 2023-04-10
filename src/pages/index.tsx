import {getUsers, JSONPlaceholderTypes} from "@/lib/api";
import Head from "next/head";
import Link from "next/link";
import Card from "@/comps/Card";


export const getServerSideProps = async () => {
  const users: JSONPlaceholderTypes.User[] = await getUsers()
  return {
    props: {
      users
    },
  }
}


export default function Home( { users }: { users: JSONPlaceholderTypes.User[] }) {
  return (
    <>
      <Head>
       <title>User directory</title>
        <meta name="description" content="All users on the app." />
      </Head>
      <h3 className="text-gray-400">All users</h3>
      <div className="container columns-1 sm:columns-2 md:columns-3 mx-auto">
        {users.map(({id, name, username}) =>
            <Link href={'/users/' + id} key={id}><Card key={id} title={name}><span>@{username}</span></Card></Link>
        )}
      </div>
    </>
  )
}
