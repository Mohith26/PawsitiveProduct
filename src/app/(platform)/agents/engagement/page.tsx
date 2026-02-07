import { ChatInterface } from "@/components/agents/chat-interface";

export default function EngagementAgentPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Pawsitive Pulse</h1>
        <p className="text-muted-foreground">
          Your engagement agent for community announcements, polls, and activity summaries.
        </p>
      </div>
      <ChatInterface
        apiEndpoint="/api/chat/engagement"
        agentName="Pawsitive Pulse"
        placeholder="Ask about community activity or create an announcement..."
      />
    </div>
  );
}
