import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApiRequest } from '../../hooks/useApiRequest';
import './ChannelsPage.css';

const memberUser = (member) => member?.userId || {};

const ChannelsPage = () => {
  const { user } = useAuth();
  const { request } = useApiRequest();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedChannelId = searchParams.get('channel');
  const endRef = useRef(null);

  const [channels, setChannels] = useState([]);
  const [selectedId, setSelectedId] = useState(requestedChannelId || '');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const fetchChannels = useCallback(async () => {
    setLoadingChannels(true);
    try {
      const response = await request('/api/v1/channels');
      const nextChannels = response.data?.channels || [];
      setChannels(nextChannels);
      setSelectedId((currentId) => {
        if (nextChannels.some((channel) => channel._id === currentId)) return currentId;
        if (requestedChannelId && nextChannels.some((channel) => channel._id === requestedChannelId)) {
          return requestedChannelId;
        }
        return nextChannels[0]?._id || '';
      });
      setError('');
    } catch (err) {
      setChannels([]);
      setError(err.message);
    } finally {
      setLoadingChannels(false);
    }
  }, [request, requestedChannelId]);

  const fetchMessages = useCallback(async (channelId) => {
    if (!channelId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    try {
      const response = await request(`/api/v1/channels/${channelId}/messages?limit=100`);
      setMessages(response.data?.messages || []);
      setError('');
    } catch (err) {
      setMessages([]);
      setError(err.message);
    } finally {
      setLoadingMessages(false);
    }
  }, [request]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  useEffect(() => {
    fetchMessages(selectedId);
  }, [fetchMessages, selectedId]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  const selectChannel = (channelId) => {
    setSelectedId(channelId);
    setSearchParams({ channel: channelId }, { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !selectedId || sending) return;

    setSending(true);
    try {
      const response = await request(
        `/api/v1/channels/${selectedId}/messages`,
        'POST',
        { content },
      );
      setMessages((current) => [...current, response.data.message]);
      setDraft('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const selectedChannel = channels.find((channel) => channel._id === selectedId);

  return (
    <section className="channels-page" aria-labelledby="learning-team-title">
      <header className="channels-page__intro">
        <div>
          <p className="channels-page__eyebrow">Shared workspace</p>
          <h1 id="learning-team-title">Learning Team</h1>
          <p>Your student, parent, and assigned instructor can coordinate here together.</p>
        </div>
        <button type="button" className="channels-page__refresh" onClick={fetchChannels}>
          <i className="fa-solid fa-rotate" aria-hidden="true" /> Refresh
        </button>
      </header>

      {error && <div className="channels-page__error" role="alert">{error}</div>}

      <div className="channels-shell">
        <aside className="channels-list" aria-label="Learning team channels">
          <div className="channels-list__header">
            <span>Teams</span>
            <span className="channels-list__count">{channels.length}</span>
          </div>

          {loadingChannels ? (
            <p className="channels-list__state">Loading your teams…</p>
          ) : channels.length === 0 ? (
            <div className="channels-list__empty">
              <i className="fa-solid fa-people-group" aria-hidden="true" />
              <strong>No learning team yet</strong>
              <span>An admin must assign the student to an instructor first.</span>
            </div>
          ) : (
            <div className="channels-list__items">
              {channels.map((channel) => {
                const student = channel.studentProfileId?.user;
                return (
                  <button
                    type="button"
                    key={channel._id}
                    className={`channels-list__item ${channel._id === selectedId ? 'is-active' : ''}`}
                    onClick={() => selectChannel(channel._id)}
                    aria-pressed={channel._id === selectedId}
                  >
                    <span className="channels-list__avatar">
                      {(student?.FullName || 'ST').split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </span>
                    <span>
                      <strong>{channel.name}</strong>
                      <small>{channel.members?.length || 0} members</small>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div className="channel-chat">
          {!selectedChannel ? (
            <div className="channel-chat__blank">
              <i className="fa-solid fa-comments" aria-hidden="true" />
              <h2>Select a learning team</h2>
              <p>Messages shared here are visible only to active team members.</p>
            </div>
          ) : (
            <>
              <header className="channel-chat__header">
                <div>
                  <p>Private learning team</p>
                  <h2>{selectedChannel.name}</h2>
                </div>
                <ul className="channel-members" aria-label="Channel members">
                  {selectedChannel.members?.map((member) => {
                    const memberData = memberUser(member);
                    return (
                      <li key={memberData._id || `${member.role}-${member.joinedAt}`}>
                        <span>{memberData.FullName || memberData.UserName || member.role}</span>
                        <small>{member.role}</small>
                      </li>
                    );
                  })}
                </ul>
              </header>

              <div className="channel-chat__messages" aria-live="polite">
                {loadingMessages ? (
                  <p className="channel-chat__state">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <div className="channel-chat__welcome">
                    <i className="fa-solid fa-hand-sparkles" aria-hidden="true" />
                    <strong>Start the team conversation</strong>
                    <span>Share a progress update, question, or next step.</span>
                  </div>
                ) : (
                  messages.map((message) => {
                    const sender = message.senderId || {};
                    const isMine = (sender._id || sender) === user?._id;
                    return (
                      <article
                        key={message._id}
                        className={`channel-message ${isMine ? 'is-mine' : ''}`}
                      >
                        <div className="channel-message__meta">
                          <strong>{isMine ? 'You' : sender.FullName || sender.UserName || 'Team member'}</strong>
                          <span>{sender.role}</span>
                        </div>
                        <p>{message.content}</p>
                        <time dateTime={message.createdAt}>
                          {new Date(message.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                      </article>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              <form className="channel-composer" onSubmit={handleSubmit}>
                <label htmlFor="channel-message">Message your learning team</label>
                <div>
                  <textarea
                    id="channel-message"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a progress update or ask a question…"
                    maxLength={4000}
                    rows={2}
                  />
                  <button type="submit" disabled={sending || !draft.trim()}>
                    {sending ? 'Sending…' : 'Send'}
                    <i className="fa-solid fa-paper-plane" aria-hidden="true" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChannelsPage;
