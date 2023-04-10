import {getPhotos, JSONPlaceholderTypes} from "@/lib/api";
import Head from "next/head";
import Card from "@/comps/Card";


export const getStaticProps = async () => {
    const photos: JSONPlaceholderTypes.Photo[] = await getPhotos()
    return {
        props: { photos },
        revalidate: 5 * 60,
    }
}

export default function Gallery( { photos }: {photos: JSONPlaceholderTypes.Photo[]}) {
    return <>
        <Head>
            <title>Gallery</title>
            <meta name="description" content="All images on the app." />
        </Head>
        <h3 className="text-gray-400">Gallery</h3>
        <div className="columns-1 md:columns-2 xl:columns-4">
            {photos?.map(({ id, title, url }) => <Card img={url} title={title} key={id}>{title}</Card>)}
        </div>
    </>
}

