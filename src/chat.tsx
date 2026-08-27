import { useCallback } from 'react';
import Talk from 'talkjs';
import { Session, Chatbox } from '@talkjs/react';

export default function ChatComponent() {
  const syncUser = useCallback(() => {
    // 1. Define the current logged-in user
    return new Talk.User({
      id: 'current_user_01',
      name: 'Alice Smith',
      email: 'alice@example.com',
      photoUrl: 'https://talkjs.com',
      role: 'default',
    });
  }, []);

  const syncConversation = useCallback((session: Talk.Session) => {
    // 2. Define the other user you want to chat with
    const otherUser = new Talk.User({
      id: 'other_user_02',
      name: 'Bob Jones',
      email: 'bob@example.com',
      photoUrl: 'https://talkjs.com',
      role: 'default',
    });

    // 3. Create a unique ID for this 1-on-1 chat room
    const conversationId = Talk.oneOnOneId(session.me.id, otherUser.id);
    const conversation = session.getOrCreateConversation(conversationId);

    // 4. Add both participants to the conversation
    conversation.setParticipant(session.me);
    conversation.setParticipant(otherUser);

    return conversation;
  }, []);

  return (
    // Replace "YOUR_APP_ID" with the App ID from your TalkJS dashboard
    <Session appId="YOUR_APP_ID" syncUser={syncUser}>
      <div style={{ height: '500px', width: '400px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <Chatbox
          syncConversation={syncConversation}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </Session>
  );
}
