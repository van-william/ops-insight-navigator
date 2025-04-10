[![Netlify Status](https://api.netlify.com/api/v1/badges/3cec0fbc-fd7c-4c92-9d60-fae84d87cd4e/deploy-status)](https://app.netlify.com/sites/ops-insights/deploys)

website: https://ops-insights.netlify.app

# Ops Insight Navigator

A modern web application for assessing and improving manufacturing operations, with a focus on high-mix, low-volume (HMLV) environments.

## Motivation

Manufacturing operations, especially in HMLV environments, face unique challenges that traditional assessment tools don't adequately address. This tool provides:

- Structured assessment of operational maturity
- Industry-specific benchmarking
- AI-powered guided discovery for improvement opportunities
- Real-time tracking and visualization of progress

## Features

- **Maturity Assessment**: Evaluate your operations across 10 key dimensions
- **Benchmark Comparison**: Compare your performance against industry standards
- **Guided Discovery**: AI-assisted exploration of improvement opportunities
- **Visual Analytics**: Interactive charts and dashboards for insights
- **Progress Tracking**: Monitor improvements over time

## Getting Started

### Prerequisites

- Node.js 18+ (we recommend using nvm)
- Supabase account
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ops-insight-navigator.git
   cd ops-insight-navigator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase and OpenAI credentials in `.env`

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

1. Create a new Supabase project
2. Run the migrations:
   ```bash
   supabase db push
   ```
3. (Optional) Load sample data:
   ```bash
   supabase db reset --db-url=your-db-url
   ```

## Development

- Built with React + Vite + TypeScript
- UI components from shadcn/ui
- Styling with Tailwind CSS
- Database and auth with Supabase
- State management with TanStack Query

See `.cursor/rules/development.md` for coding guidelines and best practices.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Supabase](https://supabase.com/)
- AI features by [OpenAI](https://openai.com/)

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
