import Head from 'next/head'
import Link from 'next/link'
import { useSession } from '@supabase/auth-helpers-react'
import { supabase } from '@/lib/supabaseClient'
import Post from '@/components/Post'
import { useMemo, useState } from 'react'
import { AiFillPlusCircle } from 'react-icons/ai'
import { BiNews } from 'react-icons/bi'
import { BsFire, BsImage, BsLink } from 'react-icons/bs'

export const getServerSideProps = async () => {
  const [posts, subreddits] = await Promise.all([
    supabase
      .from('posts')
      .select(
        '*, post_votes(*), user:posted_by(*), comments(*, user:user_id(*)), subreddit(*)'
      )
      .order('created_at', { ascending: false }),
    supabase.from('subreddits').select('*'),
  ])

  return {
    props: { posts: posts.data, subreddits: subreddits.data },
  }
}

const sortByDate = (posts) => {
  return posts.sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at)
  })
}

const sortByUpvotes = (posts) => {
  return posts.sort((a, b) => {
    return b.upvotes - a.upvotes
  })
}

export default function Home({ posts, subreddits }) {
  const session = useSession()
  const [sort, setSort] = useState('new')

  posts = useMemo(
    () =>
      posts.map((post) => {
        const upvotes = post.post_votes.reduce((acc, vote) => {
          return acc + (vote.is_upvote ? 1 : -1)
        }, 0)
        return { ...post, upvotes }
      }),
    [posts]
  )

  const handleSort = (sortBy) => {
    if (sortBy === 'new') {
      posts = sortByDate(posts)
    } else if (sortBy === 'top') {
      posts = sortByUpvotes(posts)
    }
    setSort(sortBy)
  }

  return (
    <>
      <Head>
        <title>Reddit Clone</title>
        <meta name='description' content='A clone of Reddit' />
      </Head>
      <main className='px-3 mt-5'>
        <div className='max-w-2xl mx-auto'>
          {session && (
            <div className='flex items-center gap-2 mb-3 bg-white p-2 border rounded'>
              <Link
                className='grow flex items-center gap-2'
                href='/create-post'
              >
                <AiFillPlusCircle className='text-4xl text-neutral-500' />{' '}
                <input
                  className='border w-full rounded px-3 py-2 bg-neutral-50 hover:bg-white'
                  placeholder='Create Post'
                  type='text'
                />
              </Link>
              <Link href='/create-post?type=image'>
                <BsImage className='text-2xl text-neutral-500 hover:bg-neutral-100 cursor-pointer h-10 w-10 p-2 rounded' />
              </Link>
              <Link href='/create-post?type=link'>
                <BsLink className='text-2xl text-neutral-500 hover:bg-neutral-100 cursor-pointer h-10 w-10 p-2 rounded' />
              </Link>
            </div>
          )}
          <div className='mb-3 bg-white border rounded p-3'>
            <div className='flex gap-3'>
              <button
                className={`flex items-center gap-2 border hover:bg-neutral-200 px-2 py-1 text-lg rounded ${
                  sort === 'new' && 'bg-neutral-200'
                }`}
                onClick={() => handleSort('new')}
              >
                <BiNews /> New
              </button>
              <button
                className={`flex items-center gap-2 border hover:bg-neutral-200 px-3 py-1 text-lg rounded ${
                  sort === 'top' && 'bg-neutral-200'
                }`}
                onClick={() => handleSort('top')}
              >
                <BsFire /> Top
              </button>
            </div>
          </div>
          <div className='flex sm:gap-2'>
            <div className='max-w-2xl grow'>
              <ul>
                {posts.map((post, i) => {
                  return <Post key={post.id} {...post} />
                })}
              </ul>
            </div>
            <Subreddits subreddits={subreddits} />
          </div>
        </div>
      </main>
    </>
  )
}

function Subreddits({ subreddits }) {
  return (
    <aside>
      <div className='rounded border p-5 hidden sm:block'>
        <h2 className='text-sm mb-3 uppercase'>Subreddits</h2>
        <ul>
          {subreddits.map(({ name }, i) => (
            <Link className='block hover:underline' href={`/r/${name}`} key={i}>
              /r/{name}
            </Link>
          ))}
        </ul>
      </div>
    </aside>
  )
}
