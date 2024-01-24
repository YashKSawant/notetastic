# Notetastic - A Clone of [Notion](https://www.notion.so/)

Notetastic is a web application for note making made using predominantly using Next.js and Tailwind CSS targeting basic features of [Notion](https://www.notion.so/)


## Highlighted Features

1. Note - Note is a document or collection of documents consisting Rich text.
2. Document - Each document consist of cover image and content of document.
3. Archive Deletion - The document gets soft delete and stores in trash to restore back the document.
4. Publish document - Each document can be published and made available freely accessible on internet without login. 


## To run locally

Refer the `.env.example` to create an env file as given.
The env file requires Convex, Clerk and Edgestore Access & Secret Keys

```sh
npm i # install node modules
npm run dev # create build
```

```sh
npm convex dev # to run dev version of convex
```


## Technologies Used

1. [NextJS](https://nextjs.org/)
2. [Tailwind CSS](https://tailwindcss.com)
3. [Convex](https://convex.dev/)
4. [Clerk](https://clerk.com/)
5. [EdgeStore](https://edgestore.dev/)