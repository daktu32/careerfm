import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Career.fm
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            他己紹介風の音声名刺を生成・共有できるWebサービス
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            NotebookLMや自作音声を用いて「人となり」を伝える新しい音声プロフィール体験を提供します。
          </p>
        </header>

        <div className="flex justify-center space-x-4 mb-16">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/dashboard"
            className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            ダッシュボード
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🎵 音声アップロード
            </h3>
            <p className="text-gray-600">
              MP3/WAVファイル（最大10MB）をアップロードして、あなたの声を音声名刺に。
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              👤 プロフィール作成
            </h3>
            <p className="text-gray-600">
              名前、肩書き、リンク、自己紹介テキストで完璧なプロフィールを作成。
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🌐 シェア・公開
            </h3>
            <p className="text-gray-600">
              固定URL発行、SNSシェアボタンで簡単に音声名刺を共有できます。
            </p>
          </div>
        </div>

        <footer className="text-center mt-16 text-gray-500">
          <p>© 2025 Career.fm - MVP開発中</p>
        </footer>
      </div>
    </div>
  );
}