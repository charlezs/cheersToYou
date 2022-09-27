import type { LoaderFunction } from '@remix-run/node'
import { requireUserId } from '~/utils/auth.server'
import { Layout } from '~/components/layout'
import { UserPanel } from '~/components/user-panel'
import { getOtherUsers } from '~/utils/user.server'
import {json} from '@remix-run/node'
import { useLoaderData, Outlet } from '@remix-run/react'
import { getFilteredCheer } from '~/utils/cheer.server'
import { Cheer } from '~/components/cheer'
import { Cheer as ICheer, Profile } from '@prisma/client'
import { SearchBar } from '~/components/search-bar'

interface CheerWithProfile extends ICheer {
  author: {
    profile: Profile
  }
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request)
    const users = await getOtherUsers(userId)
    const cheers = await getFilteredCheer(userId, {}, {})
    return json({ users, cheers })
}

export default function Home() {
  const { users, cheers } = useLoaderData()
  return (
    <Layout>
      <Outlet />
      <div className="h-full flex">
        <UserPanel users={users} />
          <div className="flex-1 flex flex-col">
            <SearchBar />          
          <div className="flex-1 flex">
            <div className="w-full p-10 flex flex-col gap-y-4">
              {cheers.map((cheer: CheerWithProfile) => (
                <Cheer key={cheer.id} cheer={cheer} profile={cheer.author.profile} />
              ))}
            </div>
            {/* Recent Kudos Goes Here */}
          </div>
        </div>
      </div>
    </Layout>
  )
}