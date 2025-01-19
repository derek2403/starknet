import React, { useState } from 'react';

const Forum = ({ onClose }) => {
  const [selectedForum, setSelectedForum] = useState(null);
  const [isAddingForum, setIsAddingForum] = useState(false);
  const [forumData, setForumData] = useState([
    {
      id: 1,
      title: "Welcome to our Community",
      description: "Introduction and guidelines for new members",
      content: "Welcome to our community! Here are the full guidelines and rules..."
    },
    {
      id: 2,
      title: "Technical Discussion",
      description: "Discuss technical topics and share knowledge",
      content: "This is the full content of the technical discussion forum..."
    },
  ]);

  const [newForum, setNewForum] = useState({
    title: '',
    description: '',
    content: ''
  });

  const handleForumClick = (forum) => {
    setSelectedForum(forum);
    setIsAddingForum(false);
  };

  const handleBack = () => {
    setSelectedForum(null);
    setIsAddingForum(false);
  };

  const handleAddForum = (e) => {
    e.preventDefault();
    const newForumWithId = {
      ...newForum,
      id: forumData.length + 1
    };
    setForumData([...forumData, newForumWithId]);
    setNewForum({ title: '', description: '', content: '' });
    setIsAddingForum(false);
  };

  return (
    <div className="w-3/4 h-[80vh] bg-white rounded-xl shadow-2xl p-8 mx-auto overflow-y-auto scrollbar-hide relative">
      <div className="flex justify-between items-center mb-8">
        {(selectedForum || isAddingForum) && (
          <button 
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50"
          >
            <span className="text-xl">←</span> Back
          </button>
        )}
        <h1 className={`text-2xl font-bold text-blue-600 ${(selectedForum || isAddingForum) ? 'mx-auto' : ''}`}>
          Community Forum
        </h1>
        <button 
          className="text-3xl text-blue-600 hover:text-red-500 transition-colors ml-auto w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {!selectedForum && !isAddingForum ? (
        <div className="space-y-6">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
            {forumData.map((forum) => (
              <div 
                key={forum.id}
                className="p-6 bg-blue-50 rounded-xl cursor-pointer 
                           hover:bg-blue-100 transition-all transform hover:-translate-y-1 hover:shadow-lg
                           border border-blue-200"
                onClick={() => handleForumClick(forum)}
              >
                <h3 className="text-xl font-bold text-blue-700 mb-3">
                  {forum.title}
                </h3>
                <p className="text-blue-600">
                  {forum.description}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setIsAddingForum(true)}
            className="w-full p-4 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 transition-all transform hover:-translate-y-1 hover:shadow-lg"
          >
            + Create New Forum
          </button>
        </div>
      ) : isAddingForum ? (
        <form onSubmit={handleAddForum} className="space-y-6">
          <h2 className="text-3xl font-bold text-blue-600 mb-6">Create New Forum</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Forum Title"
              className="w-full p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-600 placeholder-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={newForum.title}
              onChange={(e) => setNewForum({...newForum, title: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Short Description"
              className="w-full p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-600 placeholder-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={newForum.description}
              onChange={(e) => setNewForum({...newForum, description: e.target.value})}
              required
            />
            <textarea
              placeholder="Forum Content"
              className="w-full p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-600 placeholder-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-h-[200px]"
              value={newForum.content}
              onChange={(e) => setNewForum({...newForum, content: e.target.value})}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-4 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Forum
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-blue-600 mb-6 border-b border-blue-200 pb-4">
            {selectedForum.title}
          </h2>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <p className="text-blue-600 leading-relaxed">
              {selectedForum.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
