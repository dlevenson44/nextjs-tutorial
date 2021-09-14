import { GetStaticProps } from 'next'
import Head from 'next/head'
import Date from '../../components/date'
import Layout from '../../components/layout'
import { getAllPostIds, getPostData } from '../../lib/posts'
import utilStyles from '../../styles/utils.module.css'

export default function Post({ postData }) {
    console.log('PD:  ', postData)
    return (
        <Layout>
            <Head>
                <title>{postData.title}</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>{postData.title}</h1>
                <div className={utilStyles.lightText}>
                <Date dateString={postData.date} />
                </div>
                <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            </article>
        </Layout>
    )
}

export async function getStaticPaths() {
    // retun list of possible values for id
    const paths = getAllPostIds()
    console.log('atp:  ', paths)
    return { paths, fallback: false}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const postData = await getPostData(params.id)
    return { props: { postData } }
}
