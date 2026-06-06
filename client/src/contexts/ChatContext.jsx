import { createContext, useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { echo } from '../api/websocket'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/config'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
    const { conversationId } = useParams()
    const [messages, setMessages] = useState([])
    const [typingUsers, setTypingUsers] = useState([])
    const [onlineUsers, setOnlineUsers] = useState([])

    const queryClient = useQueryClient()
    const currentConvId = conversationId ?? 1

    // 1. Konversation laden
    const { data, refetch } = useQuery({
        queryKey: ['conversation', currentConvId],
        queryFn: async () => {
            const response = await api.get(`/api/conversations/${currentConvId}`)
            return response.data
        }
    })

    // 2. Nachricht löschen Mutation
    const deleteMessageMutation = useMutation({
        mutationFn: async (messageId) => {
            await api.delete(`/api/conversations/${currentConvId}/messages/${messageId}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversation', currentConvId] })
        }
    })

    // 3. Nachricht senden Mutation (NEU!)
    const sendMessageMutation = useMutation({
        mutationFn: async ({ content, files }) => {
            const formData = new FormData()
            formData.append('content', content)
            Array.from(files).forEach(file => formData.append('attachments[]', file))

            const response = await api.post(
                `/api/conversations/${conversationId}/messages`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            return response.data
        }
    })

    // Neu laden, wenn sich die ID ändert
    useEffect(() => {
        if (!conversationId) return
        refetch() // Hier stand vorher das undefinierte apiRefresh()
    }, [conversationId, refetch])

    // WebSocket Handlers
    useEffect(() => {
        if (data?.messages) {
            setMessages(data.messages)
        }

        if (!conversationId) return

        const channel = echo.join(`chat.conversation.${conversationId}`)
            .here(users => setOnlineUsers(users))
            .joining(user => setOnlineUsers(prev => [...prev, user]))
            .leaving(user => setOnlineUsers(prev => prev.filter(u => u.id !== user.id)))
            .listen('MessageSent', newMessage => {
                setMessages((prevMessages) => {
                    if (!prevMessages.some((msg) => msg.id === newMessage.id)) {
                        const updatedMessages = [...prevMessages, newMessage]
                        const scroller = document.querySelector('html');
                        if (scroller.offsetHeight - scroller.clientHeight <= scroller.scrollTop + 15) {
                            setTimeout(() => {
                                scroller.scrollTop = scroller.offsetHeight - scroller.clientHeight + 90000
                            }, 0)
                        }
                        return updatedMessages
                    }
                    return prevMessages
                })
            })
            .listen('ConversationRead', participant => {
                setMessages((prevMessages) => {
                    return [...prevMessages].map(msg => {
                        if (!msg?.read_at && participant.user_id) {
                            const is_participant_after_created = new Date(participant.last_read_at + ".000000Z") > new Date(msg.created_at)
                            if (is_participant_after_created)
                                msg.read_at = participant.last_read_at
                        }
                        return msg
                    })
                })
            })
            .listen('MessageUpdated', message =>
                setMessages(prev => prev.map(m => m.id === message.id ? message : m))
            )
            .listen('MessageDeleted', data => {
                setMessages(prev => prev.filter(m => m.id !== data.message.id))
            })
            .listen('UserTyping', ({ userId, isTyping }) => {
                setTypingUsers(prev => isTyping
                    ? [...new Set([...prev, userId])]
                    : prev.filter(id => id !== userId)
                )
            })

        // WICHTIG: Das solltest du in Zukunft eventuell einkommentieren, 
        // damit du beim Wechseln von Chats keine doppelten Listener hast!
        // return () => echo.leave(`chat.conversation.${conversationId}`)
    }, [data, conversationId])

    // Context Value zusammenbauen
    const value = {
        conversation: data,
        messages,
        typingUsers,
        onlineUsers,

        // React Query isPending ersetzt deine alten Loading-States
        deleteMessageLoading: deleteMessageMutation.isPending,
        deleteMessage: async (message_id) => {
            deleteMessageMutation.mutate(message_id)
        },

        sendMessageLoading: sendMessageMutation.isPending,
        sendMessage: async (content, files) => {
            // mutateAsync gibt ein Promise zurück, falls du in der Komponente
            // auf das Ergebnis warten willst (z.B. um das Textfeld zu leeren)
            return await sendMessageMutation.mutateAsync({ content, files })
        }
    }

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)