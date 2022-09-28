import { json, redirect } from "@remix-run/node"
import type { LoaderFunction, ActionFunction } from "@remix-run/node"
import { useLoaderData, useActionData } from "@remix-run/react"
import { Modal } from "~/components/modal";
import { getUser,  requireUserId, logout  } from "~/utils/auth.server";
import { useState, useRef, useEffect } from "react";
import { FormField } from '~/components/form-field'
import { departments } from "~/utils/constants";
import { SelectBox } from "~/components/select-box";
import { validateName } from "~/utils/validators.server";
import { updateUser, deleteUser } from "~/utils/user.server";
import type { Department } from "@prisma/client";
import { ImageUploader } from '~/components/image-uploader'


export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const userId = await requireUserId(request)

    let firstName = form.get('firstName')
    let lastName = form.get('lastName')
    let department = form.get('department')
    const action = form.get('_action')

    switch (action) {
        case 'save':
            if (
               typeof firstName !== 'string'
               || typeof lastName !== 'string'
               || typeof department !== 'string'
            ) {
               return json({ error: `Invalid Form Data` }, { status: 400 });
            }
            const errors = {
               firstName: validateName(firstName),
               lastName: validateName(lastName),
               department: validateName(department)
            }
            if (Object.values(errors).some(Boolean))
               return json({ errors, fields: { department, firstName, lastName } }, { status: 400 });
            await updateUser(userId, {
               firstName,
               lastName,
               department: department as Department
            })
            return redirect('/home')
            case 'delete':
               await deleteUser(userId)
               return logout(request)
            default:            
      return json({ error: `Invalid Form Data` }, { status: 400 });
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request)
    return json({ user })
}

export default function ProfileSettings() {
    const { user } = useLoaderData()
    const actionData = useActionData()
    const [formError, setFormError] = useState(actionData?.error || '')
    const firstLoad = useRef(true)
    const [formData, setFormData] = useState({
      firstName: actionData?.fields?.firstName || user?.profile?.firstName,
      lastName: actionData?.fields?.lastName || user?.profile?.lastName,
      department: actionData?.fields?.department || (user?.profile?.department || 'MARKETING'),
      profilePicture: user?.profile?.profilePicture || ''
    })

   useEffect(() => {
      if (!firstLoad.current) {
          setFormError('')
      }
   }, [formData])

   useEffect(() => {
      firstLoad.current = false
   }, [])

    const handleFileUpload = async (file: File) => {
      let inputFormData = new FormData()
      inputFormData.append('profile-pic', file)
      const response = await fetch('/avatar', {
         method: 'POST',
         body: inputFormData
      })
      const { imageUrl } = await response.json()
      setFormData({
         ...formData,
         profilePicture: imageUrl
      })
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
       setFormData(form => ({ ...form, [field]: event.target.value }))
    }

    return (
       <Modal isOpen={true} className="w-1/3 bg-blue-200 ">
          <div className="p-3">
           <h2 className="text-4xl font-semibold text-white text-center mb-4">Your Profile</h2>
           <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full mb-2">
                    {formError}
           </div>
          <div className="flex">
          <div className="w-1/3">
                  <ImageUploader onChange={handleFileUpload} imageUrl={formData.profilePicture || ''}/>
               </div>
            <div className="flex-1">
            <form method="post" onSubmit={e => !confirm('Are you sure?') ? e.preventDefault() : true} >
                <FormField htmlFor="firstName" label="First Name" value={formData.firstName} onChange={e => handleInputChange(e, 'firstName')} error={actionData?.errors?.firstName}/>
                <FormField htmlFor="lastName" label="Last Name" value={formData.lastName} onChange={e => handleInputChange(e, 'lastName')} error={actionData?.errors?.lastName}/>

                <SelectBox
                        className="w-full rounded-xl px-3 py-2 text-gray-400"
                        id="department"
                        label="Department"
                        name="department"
                        options={departments}
                        value={formData.department}
                        onChange={e => handleInputChange(e, 'department')}
                />

                <div className="w-full text-right mt-4">
                  <button className="rounded-xl w-full bg-white font-semibold text-blue-300 mt-4 px-16 py-2 transition duration-300 ease-in-out hover:bg-blue-100 hover:-translate-y-1"
                           name="_action"
                           value="save"
                  >
                    Save
                   </button>
                </div>
                <button name="_action" value="delete" className="rounded-xl w-full bg-red-300 font-semibold text-white mt-4 px-16 py-2 transition duration-300 ease-in-out hover:bg-red-400 hover:-translate-y-1">
                  Delete Account
                </button>
             </form>
          </div>
        </div>
       </div>
     </Modal>
    )
 }