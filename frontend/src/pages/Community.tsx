import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Layout from '../components/Layout';
import { MessageCircle, Heart, Share2, Send, Users, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../config';

const socket = io(`${API_BASE}`);

const Community = () => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language.startsWith('ta') ? 'ta-IN' : 'en-IN';
    const categoryLabel = (value: string) => t(value === 'Market' ? 'communityMarket' : value.toLowerCase());
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [newPost, setNewPost] = useState('');
    const [category, setCategory] = useState('General');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [room, setRoom] = useState('General');

    // Comment State
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const fetchPosts = async () => {
        setFetchError('');
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const { data } = await axios.get(`${API_BASE}/api/community/posts?category=${category}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(data);
        } catch (error: any) {
            console.error(error);
            setFetchError(error.response?.data?.message || t('communityLoadError'));
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
        socket.emit('join_room', room);
        socket.on('receive_message', (data) => {
            // Check if post already exists to prevent dupes from identical socket/api calls
            setPosts(prev => {
                const exists = prev.find(p => p._id === data._id);
                if (exists) return prev;
                return [data, ...prev];
            });
        });
        return () => {
            socket.off('receive_message');
        };
    }, [room, category]);

    const handleCreatePost = async (e: any) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        setLoading(true);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const { data } = await axios.post(`${API_BASE}/api/community/posts`, {
                content: newPost,
                category
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Socket emit for real-time (optional based on backend implementation)
            socket.emit('send_message', data);

            setPosts(prev => [data, ...prev]);
            setNewPost('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;

            // Optimistic Update
            setPosts(prev => prev.map(post => {
                if (post._id === postId) {
                    const isLiked = post.likes.includes(user?._id);
                    return {
                        ...post,
                        likes: isLiked
                            ? post.likes.filter((id: string) => id !== user?._id)
                            : [...post.likes, user?._id]
                    };
                }
                return post;
            }));

            await axios.put(`${API_BASE}/api/community/posts/${postId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Like failed", error);
            fetchPosts(); // Revert on error
        }
    };

    const handleComment = async (postId: string) => {
        if (!commentText.trim()) return;
        setCommentLoading(true);
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const { data } = await axios.post(`${API_BASE}/api/community/posts/${postId}/comment`, {
                text: commentText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update post in list with new comment data
            setPosts(prev => prev.map(p => p._id === postId ? data : p));
            setCommentText('');
            setActiveCommentId(null);
        } catch (error) {
            console.error("Comment failed", error);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleShare = (post: any) => {
        const text = `Check out this post on Agrostores:\n\n"${post.content}"\n- by ${post.user.name}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            alert(t('postCopied'));
        } else {
            alert(t('sharingUnsupported'));
        }
    };

    const handleDelete = async (postId: string) => {
        if (!window.confirm(t('deletePostConfirm'))) return;
        const previousPosts = posts;
        setPosts(prev => prev.filter(p => p._id !== postId)); // optimistic
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            await axios.delete(`${API_BASE}/api/community/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Delete failed', error);
            setPosts(previousPosts); // revert on failure
            alert(t('deletePostFailed'));
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
                            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <Users size={24} />
                            </span>
                            {t('community')}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Connect, discuss, and learn from fellow agricultural pioneers</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="bg-white/80 dark:bg-slate-900/80 border border-gray-200/80 dark:border-slate-800 rounded-xl p-1 flex shadow-sm backdrop-blur-md">
                            {['General', 'Market', 'Pests'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => { setCategory(c); setRoom(c); }}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        category === c 
                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm' 
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-slate-800/60'
                                    }`}
                                >
                                    {categoryLabel(c)}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={fetchPosts}
                            title={t('refresh')}
                            className="p-2.5 bg-white/80 dark:bg-slate-900/80 border border-gray-200/80 dark:border-slate-800 rounded-xl text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-sm"
                        >
                            <RefreshCw size={17} />
                        </button>
                    </div>
                </div>

                {fetchError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2"><AlertTriangle size={18} /> {fetchError}</span>
                        <button onClick={fetchPosts} className="font-semibold underline hover:text-rose-800 whitespace-nowrap">{t('tryAgain')}</button>
                    </div>
                )}

                <div className="glass-card dark:bg-slate-900/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-lg relative z-20">
                    <form onSubmit={handleCreatePost}>
                        <div className="relative z-30">
                            <textarea
                                className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-gray-50/50 dark:bg-slate-800/60 transition-all text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                                rows={3}
                                placeholder={`${t('messageCategory')} #${categoryLabel(category)}...`}
                                value={newPost}
                                onChange={e => setNewPost(e.target.value)}
                                disabled={false}
                                style={{ pointerEvents: 'auto', opacity: 1 }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                            <span className="text-xs text-gray-400 dark:text-gray-500">Posting to #{categoryLabel(category)}</span>
                            <button
                                type="submit"
                                disabled={loading || !newPost.trim()}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                            >
                                <Send size={16} />{t('post')}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-4">
                    {initialLoading && (
                        <div className="text-center py-16 text-gray-400">
                            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-emerald-500 mx-auto mb-3"></div>
                            <p className="text-xs">{t('loadingPosts')}</p>
                        </div>
                    )}
                    {!initialLoading && posts.map((post: any) => {
                        const isLiked = post.likes?.includes(user?._id);
                        const isOwnPost = post.user?._id === user?._id;
                        return (
                            <div key={post._id} className="glass-card dark:bg-slate-900/80 dark:border-slate-800/80 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                                            {post.user?.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{post.user?.name || t('unknownUser')}</h3>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                                {new Date(post.createdAt || Date.now()).toLocaleDateString(locale)} • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{categoryLabel(post.category)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    {isOwnPost && (
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            title={t('deletePost')}
                                            className="text-gray-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap leading-relaxed text-sm">{post.content}</p>

                                <div className="flex items-center gap-6 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        className={`flex items-center gap-1.5 transition-colors group ${isLiked ? 'text-rose-500 font-semibold' : 'hover:text-rose-500'}`}
                                    >
                                        <Heart size={18} className={`transition-transform ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
                                        <span>{post.likes?.length || 0}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveCommentId(activeCommentId === post._id ? null : post._id);
                                            setCommentText('');
                                        }}
                                        className={`flex items-center gap-1.5 transition-colors ${activeCommentId === post._id ? 'text-emerald-500 font-semibold' : 'hover:text-emerald-500'}`}
                                    >
                                        <MessageCircle size={18} />
                                        <span>{post.comments?.length || 0}</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare(post)}
                                        className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors"
                                    >
                                        <Share2 size={18} />
                                    </button>
                                </div>

                                {/* Comments Section */}
                                {activeCommentId === post._id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 animate-in slide-in-from-top-2">
                                        <div className="space-y-2.5 mb-3 max-h-60 overflow-y-auto custom-scrollbar">
                                            {post.comments?.map((comment: any, idx: number) => (
                                                <div key={idx} className="bg-gray-50/80 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 p-3 rounded-xl text-xs">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-gray-800 dark:text-gray-200">{comment.user?.name || t('user')}</span>
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(comment.createdAt).toLocaleDateString(locale)}</span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                                                </div>
                                            ))}
                                            {(!post.comments || post.comments.length === 0) && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2 italic">{t('noComments')}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder={t('writeComment')}
                                                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-50/70 dark:bg-slate-800/70 text-gray-900 dark:text-white text-xs"
                                                onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                                            />
                                            <button
                                                onClick={() => handleComment(post._id)}
                                                disabled={commentLoading || !commentText.trim()}
                                                className="px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                                            >
                                                <Send size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {!initialLoading && posts.length === 0 && !fetchError && (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                            <MessageCircle size={44} className="mx-auto mb-2 opacity-30 text-emerald-500" />
                            <p className="text-xs">{t('noMessagesInCategory', { category: categoryLabel(category) })}</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Community;
