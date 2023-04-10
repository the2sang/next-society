import { JSONPlaceholderTypes} from "@/lib/api";
//import Head from "next/head";
import Link from "next/link";
//import Card from "@/comps/Card";


// export const getServerSideProps = async () => {
//   const users: JSONPlaceholderTypes.User[] = await getUsers()
//   return {
//     props: {
//       users
//     },
//   }
// }


export default function Home() {
  return (
    <>
        <header className="sticky top-0 bg-black shadow p-4">
            <h1 className="text-white text-2xl">PPA BATCH 조회</h1>
        </header>
        <main className="p-4">
            <Link href="/ppa/page">PPA Page</Link>
        </main>
    </>
  )
}
