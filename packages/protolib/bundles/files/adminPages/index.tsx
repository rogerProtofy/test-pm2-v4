import { NextPageContext } from 'next'
import { API, withSession, Tinted, Center, getURLWithToken, SSR, usePrompt, AdminPage } from 'protolib'
import dynamic from 'next/dynamic'
import { Spinner } from 'tamagui'
import { useRouter } from 'next/router';
import { useState } from 'react';
import { getPendingResult } from 'protolib/base';
import { usePendingEffect } from 'protolib/lib/usePendingEffect';
import { useUpdateEffect } from 'usehooks-ts';

const FileBrowser = dynamic<any>(() =>
    import('protolib/adminpanel/next/components/FileBrowser').then(module => module.FileBrowser),
    { ssr: false, loading:() => <Tinted><Center><Spinner size='small' color="$color7" scale={4} /></Center></Tinted>}
);

function FilesPage({initialFilesState, pageSession}:any) {
  usePrompt(() => CurrentFile ? ``:`At this moment the user is using a web file manager. The file manager allows to view and manage the files and directories of the project.
  The web file managers allow to create, view and edit files, has an integrated source code editor, an integrated visual programming editor and allows to upload and download files from the system.
  Using the file manager you have full control of the system because you can directly edit any system file. Be careful when editing sensible files, like source code or system directories, you may break the system.
  There are interesting directories:
  - /data/databases contain the databases (leveldb files)
  - /apps contain the system applications (next, expo, redbird proxy and express apis)
  - /apps/next/public publicly accesible directory. The files you upload here can be accessed from the public system url (its the public directory of the next app)
  - /packages/app/bundles/custom the custom bundle. The system encourages extension through bundles, and the custom bundle is the bundle for your specific system. You can extend the system from this bundle, or create other bundles. bundles can add apis, pages, tasks, objects and more things 
  
  Currently the user is in the directory: ${CurrentPath}. 
  ${CurrentFile?'The user is viewing the file'+CurrentFile:`The directory contents are: ${JSON.stringify(filesState)}`}
  `) 
  const router = useRouter();
  const CurrentPath = router.query.path ?? '/'
  const CurrentFile = router.query.file ? CurrentPath + '/' + router.query.file.split('/')[0] : null
  const [filesState, setFilesState] = useState(initialFilesState ?? getPendingResult('pending'))

  useUpdateEffect(() => {API.get({ url: '/adminapi/v1/files/'+CurrentPath }, setFilesState)}, [CurrentPath])
  usePendingEffect((s) => { API.get({ url: '/adminapi/v1/files/'+CurrentPath }, s) }, setFilesState, initialFilesState)

  return (
      <AdminPage pageSession={pageSession} title={"Files"} >
        <FileBrowser path={CurrentPath} file={CurrentFile} filesState={filesState} />
      </AdminPage>
  )
}

export default {
    'admin/files': {component: FilesPage }
}