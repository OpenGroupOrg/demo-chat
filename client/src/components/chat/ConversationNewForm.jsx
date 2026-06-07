import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { AtSymbolIcon, KeyIcon } from '@heroicons/react/24/solid'
import SearchableSelect from '../ui/SearchableSelect'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/config'

export default function ConversationNewForm() {
    const queryClient = useQueryClient()

    const [data, setData] = useState({
        type: '',
        name: '',
        users: null,
    })

    const [errorMsg, setErrorMsg] = useState('')

    // React Query übernimmt den AbortController, wir brauchen nur den Suchbegriff!
    const [searchTerm, setSearchTerm] = useState('')

    // 1. Users laden (mit automatischem Abort beim Tippen)
    const { data: users, isLoading: loadingUsers } = useQuery({
        // Der queryKey enthält jetzt den searchTerm. Ändert sich der Term, 
        // wird automatisch neu geladen und der alte Request abgebrochen.
        queryKey: ['users', searchTerm],
        queryFn: async ({ signal }) => { // signal kommt automatisch von React Query!
            const response = await api.get('/api/users', {
                params: { q: searchTerm || undefined },
                signal: signal
            })
            return response.data
        }
    })

    console.log('Users for Search:', users)

    // 2. Mutation für die neue Konversation
    const createConversation = useMutation({
        mutationFn: async (newConversation) => {
            const response = await api.post('/api/conversations', newConversation)
            return response.data
        },
        onSuccess: () => {
            // Nach Erfolg: Liste aktualisieren!
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
            console.info('Created Successfully !')
            setErrorMsg('')
            // Optional: setData({...}) um das Formular wieder zu leeren
        },
        onError: (error) => {
            console.error('Creation failed:', error);
            setErrorMsg(error.response?.data?.message || 'Creation failed');
        }
    })

    console.log('Conversation Data:', data)

    // 3. Form Submit
    const handleSubmit = (e) => {
        e.preventDefault()
        // Mutate führt die mutationFn aus (try/catch ist intern in onError/onSuccess geregelt)
        createConversation.mutate(data)
    }

    // 4. Suche updaten
    const onSearchUser = (filter) => {
        if (filter !== searchTerm) {
            setSearchTerm(filter)
        }
    }

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-3xl mb-2 border-b border-b-base-content">Make new Conversation</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 grow">
                <label className="input validator w-full pl-1" htmlFor="name">
                    <AtSymbolIcon height={"90%"} />

                    <input
                        type="text"
                        className="w-full"
                        id="name"
                        placeholder="Give your conversation name"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        required
                    />
                </label>
                <div className="validator-hint hidden">Enter valid name</div>

                <div className="validator pl-1">
                    <label htmlFor="type_group">
                        <span className="mx-2 label"> Group </span>
                        <input
                            type="radio"
                            className="radio radio-primary"
                            name="type"
                            id="type_group"
                            value="group"
                            onChange={(e) => setData({ ...data, type: e.target.value })}
                            required
                        />
                    </label>

                    <label htmlFor="type_private">
                        <span className="mx-2 label"> / Or Private</span>
                        <input
                            type="radio"
                            className="radio radio-primary"
                            name="type"
                            id="type_private"
                            value="private"
                            onChange={(e) => setData({ ...data, type: e.target.value })}
                            required
                        />
                    </label>
                </div>
                <div className="validator-hint hidden">Enter valid type</div>

                <label className="input w-full">
                    <span className="label !me-0">Participants </span>
                    <SearchableSelect
                        disabled={data.type === ''}
                        isMultiple={data.type === 'group'}
                        inputName='users'
                        options={users || []} // Falls users undefined ist, Fallback auf leeres Array
                        onSearch={(q) => onSearchUser(q)}
                        onChange={(selectedUsers) => setData({ ...data, users: selectedUsers.map(user => user.id) })}
                        loading={loadingUsers}
                        getShowInfo={(user) => { return { title: user.name, value: user.id } }}
                        className="w-full"
                    />
                </label>

                <div className="grow"></div>

                {errorMsg && <div className="text-error">{errorMsg}</div>}

                <button
                    type="submit"
                    className="btn btn-primary w-full grow-0"
                    disabled={createConversation.isPending}
                >
                    {createConversation.isPending ?
                        <span className="loading loading-infinity loading-xl text-primary"></span>
                        :
                        'Make Conversation'
                    }
                </button>
            </form>
        </div>
    )
}