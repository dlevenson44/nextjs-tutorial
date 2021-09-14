import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory)
    // return array where each object has a params object
    // params object has ID for routing-- [{ params: { id: 'ssg-ssr' } }, { params: { id: 'pre-rendering' } } ]
    return fileNames.map(fileName => {
        return { params: { id: fileName.replace(/\.md$/, '')}}
    })
}

// export async function getAllPostIds() {
//   // Instead of the file system,
//   // fetch post data from an external API endpoint
//   const res = await fetch('..')
//   const posts = await res.json()
//   return posts.map(post => {
//     return {
//       params: {
//         id: post.id
//       }
//     }
//   })
// }

// Async added b/c we need to use `await` for remark
export async function getPostData(id) {
    console.log('ID: ', id)
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data
  }
}

export function getSortedPostsData() {
    // get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames.map(fileName => {
        // remove .md from file name to get the id
        const id = fileName.replace(/\.mds$/, '')
        
        // Read MD file as string
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')

        // use gray-matter to parse the metadata section
        const matterResult = matter(fileContents)

        // combine data with id
        return { id, ...matterResult.data }
    })

    // sort posts by date
    return allPostsData.sort(({ date: a }, { date: b }) => {
        if (a < b) return 1
        if (a > b) return -1
        return 0
    })
}
