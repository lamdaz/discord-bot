import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Music, 
  Play, 
  SkipForward, 
  Pause, 
  ListMusic, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Github,
  Bot,
  Radio,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import './App.css';

function App() {
  const [botStatus, setBotStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [commands, setCommands] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Check bot status
  const checkBotStatus = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setBotStatus('online');
        toast.success('Bot API is running!');
      } else {
        setBotStatus('offline');
        toast.error('Bot API is not responding');
      }
    } catch (error) {
      setBotStatus('offline');
      toast.error('Failed to check bot status');
    }
  };

  // Register commands
  const registerCommands = async () => {
    try {
      const response = await fetch('/api/discord/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        loadCommands();
      } else {
        toast.error(data.error || 'Failed to register commands');
      }
    } catch (error) {
      toast.error('Failed to register commands');
    }
  };

  // Load commands
  const loadCommands = async () => {
    try {
      const response = await fetch('/api/discord/commands');
      const data = await response.json();
      setCommands(data.commands || []);
    } catch (error) {
      console.error('Failed to load commands');
    }
  };

  // Search music
  const searchMusic = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/music/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results || []);
        toast.success(`Found ${data.results?.length || 0} results`);
      } else {
        toast.error(data.error || 'Search failed');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Discord Music Bot</h1>
                <p className="text-xs text-white/60">Serverless Music Player for Vercel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="https://discord.com/developers/applications" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Discord Dev Portal
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 bg-black/30 backdrop-blur">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-500/20">
              <Radio className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="commands" className="data-[state=active]:bg-purple-500/20">
              <Bot className="w-4 h-4 mr-2" />
              Commands
            </TabsTrigger>
            <TabsTrigger value="music" className="data-[state=active]:bg-purple-500/20">
              <Music className="w-4 h-4 mr-2" />
              Music
            </TabsTrigger>
            <TabsTrigger value="setup" className="data-[state=active]:bg-purple-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Setup
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Card */}
              <Card className="bg-black/30 border-white/10 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-purple-400" />
                    Bot Status
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Check if your bot API is running
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/80">API Status:</span>
                    <Badge 
                      variant={botStatus === 'online' ? 'default' : botStatus === 'offline' ? 'destructive' : 'secondary'}
                      className={botStatus === 'online' ? 'bg-green-500' : ''}
                    >
                      {botStatus === 'online' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {botStatus === 'offline' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {botStatus === 'checking' && 'Checking...'}
                      {botStatus === 'online' && 'Online'}
                      {botStatus === 'offline' && 'Offline'}
                    </Badge>
                  </div>
                  <Button 
                    onClick={checkBotStatus} 
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    Check Status
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-black/30 border-white/10 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Play className="w-5 h-5 text-pink-400" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Common bot management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={registerCommands} 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Register Slash Commands
                  </Button>
                  <Button 
                    onClick={loadCommands} 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <ListMusic className="w-4 h-4 mr-2" />
                    Refresh Commands List
                  </Button>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="bg-black/30 border-white/10 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-blue-400" />
                    Bot Stats
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Current bot statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Commands:</span>
                      <span className="text-white font-mono">{commands.length || 8}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Version:</span>
                      <span className="text-white font-mono">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Platform:</span>
                      <span className="text-white font-mono">Vercel</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <Card className="mt-6 bg-black/30 border-white/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Features</CardTitle>
                <CardDescription className="text-white/60">
                  What this Discord Music Bot can do
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Play, title: 'Play Music', desc: 'Search and play from YouTube' },
                    { icon: SkipForward, title: 'Queue System', desc: 'Add songs to queue' },
                    { icon: Pause, title: 'Controls', desc: 'Pause, resume, skip' },
                    { icon: ListMusic, title: 'View Queue', desc: 'See upcoming songs' }
                  ].map((feature, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <feature.icon className="w-8 h-8 text-purple-400 mb-3" />
                      <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                      <p className="text-white/60 text-sm">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands" className="mt-6">
            <Card className="bg-black/30 border-white/10 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Slash Commands</CardTitle>
                    <CardDescription className="text-white/60">
                      Available commands for your Discord server
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={registerCommands}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Register All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {[
                      { name: '/play', desc: 'Play a song or add to queue', usage: '/play <query>' },
                      { name: '/skip', desc: 'Skip the current song', usage: '/skip' },
                      { name: '/queue', desc: 'View the music queue', usage: '/queue' },
                      { name: '/stop', desc: 'Stop and clear queue', usage: '/stop' },
                      { name: '/pause', desc: 'Pause the music', usage: '/pause' },
                      { name: '/resume', desc: 'Resume the music', usage: '/resume' },
                      { name: '/nowplaying', desc: 'Show current song', usage: '/nowplaying' },
                      { name: '/help', desc: 'Show help message', usage: '/help' }
                    ].map((cmd, i) => (
                      <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                          <code className="text-purple-400 font-mono text-sm">{cmd.name}</code>
                          <span className="text-white/40 text-xs">{cmd.usage}</span>
                        </div>
                        <p className="text-white/60 text-sm mt-1">{cmd.desc}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Music Tab */}
          <TabsContent value="music" className="mt-6">
            <Card className="bg-black/30 border-white/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Music Search</CardTitle>
                <CardDescription className="text-white/60">
                  Search for songs to play in your Discord server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="Search for a song..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchMusic()}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                  <Button 
                    onClick={searchMusic}
                    disabled={isSearching}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    {isSearching ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">Search Results</h3>
                    {searchResults.map((result, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                        <img 
                          src={result.thumbnail} 
                          alt={result.title}
                          className="w-20 h-14 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium truncate">{result.title}</h4>
                          <p className="text-white/60 text-xs">{result.channel} • {result.duration}</p>
                        </div>
                        <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Search for music to see results here</p>
                    <p className="text-white/40 text-sm mt-1">
                      Use the search box above or type /play in Discord
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup" className="mt-6">
            <Card className="bg-black/30 border-white/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Setup Guide</CardTitle>
                <CardDescription className="text-white/60">
                  How to deploy and configure your Discord Music Bot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs">1</span>
                      Create Discord Application
                    </h3>
                    <p className="text-white/60 text-sm ml-8">
                      Go to the{' '}
                      <a 
                        href="https://discord.com/developers/applications" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:underline"
                      >
                        Discord Developer Portal
                      </a>{' '}
                      and create a new application. Note down the Client ID and Public Key.
                    </p>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-2">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs">2</span>
                      Get Bot Token
                    </h3>
                    <p className="text-white/60 text-sm ml-8">
                      In the Bot section, click &quot;Reset Token&quot; to get your bot token. 
                      Keep this secret! Add it to your Vercel environment variables as{' '}
                      <code className="bg-white/10 px-1 rounded">DISCORD_BOT_TOKEN</code>.
                    </p>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-2">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs">3</span>
                      Configure Interactions Endpoint
                    </h3>
                    <p className="text-white/60 text-sm ml-8">
                      In General Information, set the Interactions Endpoint URL to:{' '}
                      <code className="bg-white/10 px-1 rounded text-xs">
                        https://your-domain.vercel.app/api/discord/interactions
                      </code>
                    </p>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-2">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs">4</span>
                      Set Environment Variables
                    </h3>
                    <div className="ml-8 space-y-2">
                      <p className="text-white/60 text-sm">Add these to your Vercel project:</p>
                      <div className="bg-black/50 p-3 rounded-lg font-mono text-xs space-y-1">
                        <div className="text-green-400">DISCORD_BOT_TOKEN=your_bot_token</div>
                        <div className="text-green-400">DISCORD_CLIENT_ID=your_client_id</div>
                        <div className="text-green-400">DISCORD_PUBLIC_KEY=your_public_key</div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-2">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs">5</span>
                      Invite Bot to Server
                    </h3>
                    <p className="text-white/60 text-sm ml-8">
                      Use this URL to invite your bot (replace YOUR_CLIENT_ID):{' '}
                      <code className="bg-white/10 px-1 rounded text-xs break-all">
                        https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=3145728&scope=bot%20applications.commands
                      </code>
                    </p>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-2">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs">6</span>
                      Register Commands
                    </h3>
                    <p className="text-white/60 text-sm ml-8">
                      Click the &quot;Register Slash Commands&quot; button in the Dashboard tab, 
                      or the commands will auto-register on first use.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              Discord Music Bot for Vercel • Built with React + Node.js
            </p>
            <div className="flex items-center gap-4">
              <a href="/api/health" className="text-white/40 hover:text-white text-sm transition-colors">
                API Health
              </a>
              <a href="/api/discord/commands" className="text-white/40 hover:text-white text-sm transition-colors">
                Commands JSON
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
