import Feature from 'app/bundles/custom/pages/services'
import { useSession } from 'protolib'

export default function ServicesPage(props:any) {
  useSession(props.pageSession)
  return <Feature.component {...props} />
}

export const getServerSideProps = Feature.getServerSideProps