import Playground from '@/components/Playground'

export default function PlaygroundPage({ params }) {
  return <Playground agentId={params.agentId} />
}