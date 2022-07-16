import { GetStaticProps, PreviewData } from 'next'
import { createClient } from '../../services/prismic'
import Head from 'next/head'
import Link from 'next/link'

import styles from './styles.module.scss'

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string;
}

interface PostsProps {
    posts: Post[]
}


export default function Posts({posts}: PostsProps) {
    return(
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map(item => (
                        <Link key={item.slug} href={`/posts/${item.slug}`}>
                             <a>
                                <time>{item.updatedAt}</time>
                                <strong>{item.title}</strong>
                                <p>{item.excerpt}</p>
                            </a>
                        </Link>
                       
                    ))}
                </div>
            </main>
        </>
    )
}




export async function getStaticProps({ previewData }) {
  const client = createClient({ previewData })

  const response = await client.getAllByType('post', {
      pageSize: 100,
  })

  const posts = response?.map((post: any) => {
    return {
        slug: post.uid,
        title: post.data.title.find((title: any) => title.type === 'heading1')?.text,
        excerpt: post.data.content.find((content: any) => content.type === 'paragraph')?.text,
            updated_at: new Date(post.last_publication_date).toLocaleDateString('pt-PT', {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
            })
    }
  })

  return {
    props: { posts }, // Will be passed to the page component as props
  }
}