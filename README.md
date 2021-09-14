This is a starter template for [Learn Next.js](https://nextjs.org/learn).

Pages are associated with a route based on their file name. For example, in development:

pages/index.js is associated with the / route.
pages/posts/first-post.js is associated with the /posts/first-post route.

Client-Side Navigation
The Link component enables client-side navigation between two pages in the same Next.js app.

Client-side navigation means that the page transition happens using JavaScript, which is faster than the default navigation done by the browser.

Here’s a simple way you can verify it:

Use the browser’s developer tools to change the background CSS property of <html> to yellow.
Click on the links to go back and forth between the two pages.
You’ll see that the yellow background persists between page transitions.
This shows that the browser does not load the full page and client-side navigation is working
if you used `<a href="/">` instead of `<Link href="/">` then browser does a full refresh

Next.js does code splitting automatically, so each page only loads what’s necessary for that page. That means when the homepage is rendered, the code for other pages is not served initially.
Only loading the code for the page you request also means that pages become isolated. If a certain page throws an error, the rest of the application would still work.
Furthermore, in a production build of Next.js, whenever Link components appear in the browser’s viewport, Next.js automatically prefetches the code for the linked page in the background. By the time you click the link, the code for the destination page will already be loaded in the background, and the page transition will be near-instant!

Assets
Next.js can serve static assets, like images, under the top-level public directory. Files inside public can be referenced from the root of the application similar to pages.$$
The public directory is also useful for robots.txt, Google Site Verification, and any other static assets. Check out the documentation for Static File Serving to learn more.
NextJS provides an `Image` component to handle optimizing images, only loading images when they enter a viewport, and ensuring images are responsive
`next/image` is an extension of HTML `<img>`
Next supports image optimization by default, allowing for resizing, optimization, and serving images in modern formats like WebP when browser supports it
- This avoids shipping large images to smaller viewport devices-- also can automatically adopt future image formats and serve them to browsers that support those formats
Automatic Image Optimization works with any image source. Even if the image is hosted by an external data source, like a CMS, it can still be optimized.

NextJS optimizes images as users request them without increasing build times (no matter how many images)
Images are lazy loaded by default -- meaning pages speed isn't penalized for images outside the viewport.
Images load as they are scrolled into the viewport
Images are always rendered in such a way as to avoid Cumulative Layout Shift, a Core Web Vital that Google is going to use in search ranking.
NextJS has built-in support for styled-jsx but you can use other libraries such as styled-components or emotion if you'd like
NextJS has built-in support for both CSS and Sass, also supports Tailwind CSS and other popular CSS libraries
CSS Modules automatically generates unique class names, meaning we don't have to worry about class name collisions
Code splitting works on CSS modules-- ensures minimal amount of CSS is loaded for each page, resulting in a smaller bundle size
CSS modules are extracted from JS bundles at build time and generate .css files that are automatically loaded by Next

`pages/_app.js` file is a top-level component which will be common accross different pages
- This can be used to keep state when navigating pages
- Applies global styles, cannot be imported from anywhere else but `pages/_app.js`
- Global styles could impact other routes unintentionally, such as our first-post route in example


Pre-rendering
NextJS pre-renders each page-- meaning it generates HTML for each page in advance instead of it being done by clientside JS
- this can result in better performance and SEO
- each generated HTML is associated with minimal JS for that page
Hydration:  when page is loaded by browser, its JS code runs and makes the page fully interactive
Can check if pre-rendering is happening by:
- disable JS in your browser
- Try accessing the app
- This should show a fully rendered app without JS enabled
CRA doesn't support pre-rendering out of the box, so the above steps wouldn't work with it
Two forms of pre-rendering, static generation and server-side rendering... difference is WHEN it generates HTML for a page
- Static Generation: generates HTML at build time, pre-rendered HTML is reused on each request
- Server-side Rendering: generates the HTML on each request
Next lets you choose which form to use for each page-- you can even create a hybrid app that uses static generation for most pages and SSR for others
When to use which pre-render method
- Static Generation is recommended by NextJS whenever possible because your page can be built once and served by CDN, which makes it much faster than having a SSR page for each request
- SG can be used for any kind of page, regardless as to whether it is dealing with data or not
- If you can pre-render the page ahead of a user's request then choose SG, if you cannot then use SSR
- AKA-- if your pages shows frequently updated data and page content can change on each request, go for SSR
- Above would be slower but prerendered page would always be up to date
You could also skip pre-rendering altogether and rely on client-side JS to populate frequently updated data

Static Generation with Data using `getStaticProps`
- `getStaticProps` is an async function that runs at build time in PROD and can fetch external data then send it as props to the page
- Lets you tell Next "Resolve these requests before you pre-render at build time"
- In Dev, prop runs on each request instead
Each of our MD files in `/posts` (ssg-ssr and pre-rendering) have a title and a date-- this is YAML front matter, parsed using a library called gray-matter
- Next polyfills `fetch()` so it doesn't need to be imported
- We implemented `getSortedPostsData` to fetch data from the system, but you can also fetch the data from other sources like external APIs and it would work fine
```
export async function getSortedPostsData() {
  // Instead of the file system,
  // fetch post data from an external API endpoint
  const res = await fetch('..')
  return res.json()
}
```
- `getStaticProps` only runs on serverside, meaning you can write code such as direct DB queries without sending them to the browser
- Function can only be exported from a page, can't be exported from non-page... restriction is in place because React needs to have all required data before page is rendered
- Static Generation is _not_ a good idea if you can't pre-render a page ahead of a user request-- ie if page is frequently updated and content can change on each request

Server Side Rendering-- Fetching Data at Request Time
- To use SSR need to export `getServerSideProps` instead of `getStaticProps` from your page
- `getServerSideProps` is called at request time, parameter `context` contains request params
- should only be used if you need to pre-render a page whose data must be fetched at request time
- Time to first byte (TTFB) will be slower than `getStaticProps` b/c server must compute result on each request, and result cannot be cached by CDN without extra config
```
export async function getServerSideProps(context) {
    return { props: { /* data */ }}
}
```

ClientSide Rendering-- if pre-rendering isn't needed
- Statically generate parts of page that dont require external data
- When page loads fetch external data from client using JS and populate remaining parts
- useful for pages where you don't need frequent updating such as dashboard pages-- private and SEO doesn't matter

SWR-- React hook for data fetching made by Next team
- Useful for client-side data fetching, handles caching, revalidation, focus tracking, refetching on interval, and more
- SWR docs:  https://swr.vercel.app/

Page Path Depends on External Data-- above we cover where page content depends on external data using the `getProps` functions mentioned above
- Now we focus on the case when each page path depends on external data-- enabling dynamic URLs

`getStaticPaths` runs on request in Dev, but on buildtime for prod
`fallback: false` from `getStaticPaths`-- any path not returned by the function will return a 404 page
if this is set to true, the behavior changes
- path returned will be rendered to HTML at build time
- paths that haven't been generated at build time won't result in a 404 page
- - instead Next will serve a "fallback version" of the page on the first request to such a path
- in background, Next will statically generate the requested path
- - subsequent requests to same path will be served generated page, like other pages pre-rendered at buildtime
If `fallback: 'blocking'` is set, new paths will be server-side rendered with `getStaticProps`, and cached for future requests so it happens once per path

Catch-all Routes-- full docs: https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
- Dynamic routes can be extended to catch all paths by adding three dots inside brackets... (`...`)
- If you di this then you must return an array as the value `id` in `getStaticPaths`, like below
```
return [
  { params: {
    // statically generates /posts/a/b/c
    id: ['a', 'b', 'c']
  }}
  // .....
]
```
- `params.id` would then be an array in `getStaticProps`
```
export async function getStaticProps({ params }) {
  // params.id will be something like ['a', 'b', 'c']
}
```
- Can access Next router by importing `useRouter` hook from `next/router`
- Can create a custom 404 page with `pages/404.js`-- this is statically generated at build time
- Error pages docs:  https://nextjs.org/docs/advanced-features/custom-error-page

API Routes-- https://nextjs.org/docs/api-routes/introduction
- Good use case is handling form input-- can create form that sends `POST` to the API route
- - API route can then take data and have code written to directly save to database
- API route code is not part of client bundle so safe to write server code
- Can create API endpoint inside Next by creating a function inside `pages/api` that follows below format
```
// req = HTTP incoming message, res = HTTP server response
export default functio hadler(req, res) {
  // .....
}
```
- These ca be deployed Serverless Fuctios, aka Lambdas (think AWS)
- `req` is an instance of `http.IncomingMessages`-- some pre-built middlewares that can be found here: https://nextjs.org/docs/api-routes/api-middlewares
- `res` is an instance of `http.ServerResponse` plus other functions found here:  https://nextjs.org/docs/api-routes/response-helpers
Don't Fetch API Route from `getStaticProps` or `getStaticPaths`
- Instead write server-side code directly in `getStaticProps` or `getStaticPaths` (or call a helper function)
- Why?  The two hooks run only on the server-side... never on the client-side, not even included in bundled JS for the browser
- - this means you can write code such as cdirect DB queries without them being sent to the browser
- Preview Mode-- utilizes API routes to solve below problem: https://nextjs.org/docs/advanced-features/preview-mode
- - Static generation is useful to fetch data from headless CMS
- - it's not ideal when writing a draft on headless CMS and you want to preview the draft immediately on your page
- - You'd want Next to render these pages at request time instead of build time and fetch draft content instead of published content

Typescript
- When you start Next app for first time with tsconfig file in route, it will auto populate it the next time you start the app
- - Can customize these settings as needed, just default pre-populated values/fields
- - a `next-env.d.ts` file will also be created to ensure Next types are picked up by TS compiler... DO NOT TOUCH THIS FILE
TS EXAMPLES:  https://nextjs.org/learn/excel/typescript/nextjs-types