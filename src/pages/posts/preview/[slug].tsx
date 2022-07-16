import Head from "next/head"
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next"
import { useSession } from "next-auth/react"
import { RichText } from "prismic-dom"
import { createClient } from "../../../services/prismic"

import styles from '../post.module.scss'
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/router"
import { loadComponents } from "next/dist/server/load-components"

interface PostPreviewProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

export default function PostPreview({post}: PostPreviewProps) {

    const {data: session} = useSession()
    const Router = useRouter()

    

    useEffect(() => {
        if(session?.activeSubscription) {
            Router.push(`/posts/${post.slug}`)
        }
    }, [post.slug, Router, session])

    return (
        <>
            <Head>
                <title>
                    {post.title} | ignews
                </title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div className={`${styles.postContent} ${styles.previewContent}`} 
                        dangerouslySetInnerHTML={{__html: post.content}}
                    />

                    <div className={styles.continueReading}>
                        Wanna continue reading?
                        <Link href={'/'}>
                            <a>Subscribe now 🤗</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({ params, previewData}) => {
    const { slug } = params 
    

    const client = createClient({previewData})

    const response = await client.getByUID('post', String(slug))

    const post = {
        slug,
        title: response.data.title.find((title: any) => title.type === 'heading1')?.text,
        content: RichText.asHtml(response.data.content.splice(0, 3)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-PT', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
        })
    }

   return {
    props : {post},
    revalidate: 60 * 60 * 24 // 1 day
   }

   
}