import Head from 'next/head'
import Link from 'next/link'
import Date from '../components/date'
import Layout, { siteTitle } from '../components/layout'
import { getSortedPostsData } from '../lib/posts'
import utilStyles from '../styles/utils.module.css'

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return { props: { allPostsData }}
}

export default function Home({ allPostsData }) {
  console.log('apd:  ', allPostsData)
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => {
            const modifiedId = id.replace(/\.md$/, '')
            return (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/posts/${modifiedId}`}>{title}</Link>
                <small className={utilStyles.lightText}>
                  <Date dateString={date} />
                </small>
              </li>
            )
          })}
        </ul>
        <Link href="/posts/first-post">And here's the stupid link</Link>
      </section>
    </Layout>
  )
}
