import { ChatInterface } from "@/components/agents/chat-interface";

export default function RecommendAgentPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Pawsitive Advisor</h1>
        <p className="text-muted-foreground">
          AI tool recommendation agent powered by marketplace knowledge and community feedback.
        </p>
      </div>
      <ChatInterface
        apiEndpoint="/api/chat/recommend"
        agentName="Pawsitive Advisor"
        placeholder="What AI tools can help with vet patient intake?"
      />
    </div>
  );
}
