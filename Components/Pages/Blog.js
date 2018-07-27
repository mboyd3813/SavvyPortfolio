export default function Blog(posts){
    return posts
    .map((post) => `<h2>${post.title}</h2><p>${post.body}</p>`)
    .join('');
}