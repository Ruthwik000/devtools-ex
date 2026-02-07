import React, { useState, useEffect } from 'react';
import Section from '../components/Section';

const StorageSection = ({ expanded, onToggle }) => {
  const [openTabs, setOpenTabs] = useState([]);
  const [selectedTabs, setSelectedTabs] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [savedGroups, setSavedGroups] = useState([]);

  useEffect(() => {
    if (expanded) {
      loadOpenTabs();
      loadSavedGroups();
    }
  }, [expanded]);

  const loadOpenTabs = () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      setOpenTabs(tabs);
    });
  };

  const loadSavedGroups = () => {
    chrome.storage.local.get(['tabGroups'], (result) => {
      setSavedGroups(result.tabGroups || []);
    });
  };

  const toggleTabSelection = (tabId) => {
    setSelectedTabs(prev => {
      if (prev.includes(tabId)) {
        return prev.filter(id => id !== tabId);
      } else {
        return [...prev, tabId];
      }
    });
  };

  const selectAllTabs = () => {
    setSelectedTabs(openTabs.map(tab => tab.id));
  };

  const deselectAllTabs = () => {
    setSelectedTabs([]);
  };

  const saveGroup = () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (selectedTabs.length === 0) {
      alert('Please select at least one tab');
      return;
    }

    const selectedTabsData = openTabs
      .filter(tab => selectedTabs.includes(tab.id))
      .map(tab => ({
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl
      }));

    const newGroup = {
      id: Date.now(),
      name: groupName,
      tabs: selectedTabsData,
      created: new Date().toISOString()
    };

    const updatedGroups = [...savedGroups, newGroup];
    setSavedGroups(updatedGroups);
    
    chrome.storage.local.set({ tabGroups: updatedGroups }, () => {
      alert(`Group "${groupName}" saved with ${selectedTabsData.length} tabs!`);
      setGroupName('');
      setSelectedTabs([]);
    });
  };

  const restoreGroup = (group) => {
    group.tabs.forEach(tab => {
      chrome.tabs.create({ url: tab.url, active: false });
    });
    alert(`Restored ${group.tabs.length} tabs from "${group.name}"`);
  };

  const deleteGroup = (groupId) => {
    if (confirm('Delete this tab group?')) {
      const updatedGroups = savedGroups.filter(g => g.id !== groupId);
      setSavedGroups(updatedGroups);
      chrome.storage.local.set({ tabGroups: updatedGroups });
    }
  };

  const clearAllGroups = () => {
    if (confirm('Delete all saved tab groups? This cannot be undone.')) {
      setSavedGroups([]);
      chrome.storage.local.set({ tabGroups: [] });
      alert('All tab groups deleted!');
    }
  };

  return (
    <Section title="Tab Manager" expanded={expanded} onToggle={onToggle}>
      <div className="space-y-4">
        {/* Create New Group */}
        <div className="bg-[#44444E] p-3 rounded-lg border border-[#555560]">
          <div className="text-sm font-semibold text-gray-200 mb-2">Create Tab Group</div>
          
          {/* Group Name Input */}
          <input
            type="text"
            placeholder="Group name (e.g., Work, Research)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full bg-[#37353E] border border-[#555560] rounded px-3 py-2 text-sm text-gray-200 mb-2 focus:outline-none focus:border-[#6B5B95]"
          />

          {/* Select/Deselect All */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={selectAllTabs}
              className="flex-1 bg-[#6B5B95] hover:bg-[#7B6BA5] text-white text-xs py-1.5 px-3 rounded font-medium transition-colors"
            >
              Select All
            </button>
            <button
              onClick={deselectAllTabs}
              className="flex-1 bg-[#555560] hover:bg-[#666670] text-white text-xs py-1.5 px-3 rounded font-medium transition-colors"
            >
              Deselect All
            </button>
          </div>

          {/* Open Tabs List */}
          <div className="max-h-48 overflow-y-auto space-y-1 mb-2">
            {openTabs.length === 0 ? (
              <div className="text-xs text-gray-500 italic text-center py-2">No open tabs</div>
            ) : (
              openTabs.map(tab => (
                <div
                  key={tab.id}
                  onClick={() => toggleTabSelection(tab.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedTabs.includes(tab.id)
                      ? 'bg-[#6B5B95] bg-opacity-20 border border-[#6B5B95]'
                      : 'bg-[#37353E] border border-[#555560] hover:bg-[#44444E]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTabs.includes(tab.id)}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  {tab.favIconUrl && (
                    <img src={tab.favIconUrl} alt="" className="w-4 h-4" />
                  )}
                  <span className="text-xs text-gray-300 truncate flex-1">
                    {tab.title}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={saveGroup}
            disabled={selectedTabs.length === 0 || !groupName.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-[#555560] disabled:cursor-not-allowed text-white text-sm py-2 px-4 rounded font-semibold transition-colors"
          >
            Save Group ({selectedTabs.length} tabs)
          </button>
        </div>

        {/* Saved Groups */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-200">Saved Groups</div>
            {savedGroups.length > 0 && (
              <button
                onClick={clearAllGroups}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-2">
            {savedGroups.length === 0 ? (
              <div className="text-xs text-gray-500 italic text-center py-4 bg-[#44444E] rounded border border-[#555560]">
                No saved groups yet
              </div>
            ) : (
              savedGroups.map(group => (
                <div
                  key={group.id}
                  className="bg-[#44444E] p-3 rounded-lg border border-[#555560] hover:border-[#666670] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-200 mb-1">
                        {group.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {group.tabs.length} tabs • {new Date(group.created).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="text-red-400 hover:text-red-300 text-lg ml-2 transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  {/* Tab Preview */}
                  <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
                    {group.tabs.slice(0, 3).map((tab, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                        {tab.favIconUrl && (
                          <img src={tab.favIconUrl} alt="" className="w-3 h-3" />
                        )}
                        <span className="truncate">{tab.title}</span>
                      </div>
                    ))}
                    {group.tabs.length > 3 && (
                      <div className="text-xs text-gray-500 italic">
                        +{group.tabs.length - 3} more tabs
                      </div>
                    )}
                  </div>

                  {/* Restore Button */}
                  <button
                    onClick={() => restoreGroup(group)}
                    className="w-full bg-[#6B5B95] hover:bg-[#7B6BA5] text-white text-sm py-2 px-4 rounded font-medium transition-colors"
                  >
                    Restore All Tabs
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default StorageSection;
