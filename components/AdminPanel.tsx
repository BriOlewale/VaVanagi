import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { Button, Card, Input } from './UI';

export const AdminPanel: React.FC<{
  onImportSentences: (sentences: any[]) => void;
  // sentences and translations were never used → removed
  // onClearAll is passed but not "read" → we rename it with _
  _onClearAll: () => void;
}> = ({ onImportSentences, _onClearAll }) => {
  const [tab, setTab] = useState('users');
  const [users] = useState(StorageService.getAllUsers());
  const [settings, setSettings] = useState(StorageService.getSystemSettings());

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target?.result as string);
          onImportSentences(json.map((x: any) => ({ 
            id: x.id || crypto.randomUUID(), 
            english: x.english || x.sentence || x.text 
          })));
          alert('Imported successfully!');
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const saveSettings = () => { 
    StorageService.saveSystemSettings(settings); 
    alert('Settings saved!'); 
  };

  return (
    <div className="flex">
      <aside className="w-64 p-4 border-r min-h-screen bg-gray-50">
        <button className={`block w-full text-left p-3 hover:bg-gray-200 font-medium ${tab === 'users' ? 'bg-indigo-100' : ''}`} onClick={() => setTab('users')}>Users</button>
        <button className={`block w-full text-left p-3 hover:bg-gray-200 font-medium ${tab === 'data' ? 'bg-indigo-100' : ''}`} onClick={() => setTab('data')}>Data</button>
        <button className={`block w-full text-left p-3 hover:bg-gray-200 font-medium ${tab === 'settings' ? 'bg-indigo-100' : ''}`} onClick={() => setTab('settings')}>Settings</button>
      </aside>

      <main className="flex-1 p-8">
        {tab === 'users' && (
          <Card>
            <h3 className="text-xl font-bold mb-4">All Users</h3>
            {users.length === 0 ? <p>No users yet.</p> : (
              <ul className="space-y-2">
                {users.map(u => (
                  <li key={u.id} className="border-b pb-2">
                    <strong>{u.name}</strong> ({u.email}) — Role: <span className="text-indigo-600">{u.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {tab === 'data' && (
          <Card>
            <h3 className="text-xl font-bold mb-4">Import Sentences</h3>
            <input type="file" accept=".json" onChange={handleImport} className="mb-6" />
            <div>
              <Button variant="danger" onClick={_onClearAll}>
                Clear All Data (Danger!)
              </Button>
            </div>
          </Card>
        )}

        {tab === 'settings' && (
          <Card>
            <h3 className="text-xl font-bold mb-4">System Settings</h3>
            <Input 
              label="Gemini API Key" 
              value={settings.geminiApiKey || ''} 
              onChange={e => setSettings({...settings, geminiApiKey: e.target.value})}
              placeholder="sk-..." 
            />
            <Button onClick={saveSettings} className="mt-6">
              Save Settings
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};