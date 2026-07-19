import type { ReactElement } from "react";
import type { TabularPreview } from "./summarizeTabular";
import { TabularDataCard } from "./TabularDataCard";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string;
  tabularPreview?: TabularPreview;
};

export type ChatThreadProps = {
  messages: ChatMessage[];
};

export function ChatThread({ messages }: ChatThreadProps): ReactElement {
  return (
    <div className="axi-thread">
      {messages.map((message) => (
        <article
          key={message.id}
          className={`axi-message axi-message--${message.role}`}
        >
          <div className={`axi-avatar axi-avatar--${message.role}`} aria-hidden>
            {message.role === "user" ? "Y" : "A"}
          </div>
          <div className="axi-message-body">
            <div className="axi-message-content">{message.content}</div>
            {message.tabularPreview ? <TabularDataCard preview={message.tabularPreview} /> : null}
            {message.meta ? <div className="axi-message-meta">{message.meta}</div> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
