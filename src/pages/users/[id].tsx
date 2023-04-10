import {getSpecificUser, getUsers, JSONPlaceholderTypes} from "@/lib/api";
import Head from "next/head";
import Card from "@/comps/Card";


export const getStaticPaths = async () => {
    const users = await getUsers()
    return {
        paths: users.map(({id}) => {
            return {
                params: {id: id.toString()}
            }
        }),
        fallback: false
    }
}

export const getStaticProps = async (context: {params: {id: string}}) => {
    const id = context.params.id
    const user = await getSpecificUser(id)
    return {
        props: { user }
    }
}

export default function User( { user }: {user: JSONPlaceholderTypes.User}) {
    return <>
        <Head>
            <title>{user.name}</title>
            <meta name="description" content={`@${user.username} - ${user.email}`} />
        </Head>
        <div className="mt-3">
            <Card img={`https://avatars.dicebear.com/api/identicon/${user.username}.svg`} title={user.name}>
                <ul>
                    <li className="text-sm text-slate-400">{user.company.name}</li>
                    <li className="text-sky-700 hover:text-sky-500">
                        <a href={"mailto:" + user.email}>{user.email}</a>
                    </li>
                    <li className="text-sky-700 hover:text-sky-500">
                        <a href={"tel:" + user.phone}>{user.phone}</a>
                    </li>
                    <li className="text-white bg-slate-600 rounded-md p-1.5">
                        <span>{user.address.suite} {user.address.street}, {user.address.city}</span>
                    </li>
                </ul>
            </Card>
        </div>
    </>
}