import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

// TODO: Add notification after update - "Profile updated!"

export const getServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    let {
      data: profile,
      error,
      status,
    } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    return {
      props: { profile },
    }
  }

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  }
}

export default function Account({ profile }) {
  const session = useSession()
  const supabase = useSupabaseClient()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!session) throw new Error('No user')

    const username = e.target.elements.username.value
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    console.log(data, error)
    if (error) throw error
  }

  return (
    <div className='max-w-2xl mx-auto mt-10'>
      <h1 className='text-xl mb-3'>Account</h1>
      <div className='bg-white rounded p-5'>
        <form onSubmit={handleSubmit}>
          <div className='mb-5'>
            <label
              className='uppercase text-sm font-semibold'
              htmlFor='username'
            >
              Username
            </label>
            <input
              id='username'
              className='block border w-full rounded px-2 py-1'
              type='text'
            />
          </div>
          <div className='text-right'>
            <button className='rounded-full bg-neutral-600 hover:bg-neutral-500 text-neutral-100 px-4 py-1'>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}