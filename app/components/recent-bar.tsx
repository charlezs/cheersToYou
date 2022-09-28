import type { User, Cheer } from '@prisma/client'
import { UserCircle } from './user-circle'
import { emojiMap } from '~/utils/constants'

interface CheerWithRecipient extends Cheer {
    recipient: User
}

export function RecentBar ({cheers}: {cheers: CheerWithRecipient []}) {
    return (
        <div className="w-1/5 border-l-4 border-l-white flex flex-col items-center">
        <h2 className="text-xl text-white font-semibold my-6 font-sans">Recent Cheers</h2>
        <div className="h-full flex flex-col gap-y-10 mt-10">
          {cheers.map(cheer => (
            <div className="h-24 w-24 relative" key={cheer.recipient.id}>
              <UserCircle profile={cheer.recipient.profile} className="w-20 h-20" />
              <div className="h-8 w-8 text-3xl bottom-2 right-4 rounded-full absolute flex justify-center items-center">
                {emojiMap[cheer?.style?.emoji || 'CHEER']}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
}