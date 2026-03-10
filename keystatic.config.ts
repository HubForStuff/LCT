import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    programs: collection({
      label: 'Programas',
      slugField: 'title',
      path: 'src/content/programs/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        description: fields.text({ label: 'Descrição', multiline: true }),
        category: fields.select({
          label: 'Categoria',
          options: [
            { label: 'Programas de Expansão', value: 'expansion' },
            { label: 'Parcerias de Inovação', value: 'partnerships' },
            { label: 'Consultoria', value: 'advisory' },
          ],
          defaultValue: 'expansion',
        }),
        featured: fields.checkbox({ label: 'Destacado', defaultValue: false }),
        image: fields.image({ label: 'Imagem', directory: 'public/images/programs' }),
        content: fields.markdoc({ label: 'Conteúdo' }),
      },
    }),
    competitions: collection({
      label: 'Competições',
      slugField: 'title',
      path: 'src/content/competitions/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        description: fields.text({ label: 'Descrição', multiline: true }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Aberto', value: 'open' },
            { label: 'Em Andamento', value: 'ongoing' },
            { label: 'Encerrado', value: 'closed' },
          ],
          defaultValue: 'open',
        }),
        deadline: fields.date({ label: 'Prazo' }),
        prize: fields.text({ label: 'Prêmio' }),
        featured: fields.checkbox({ label: 'Destacado', defaultValue: false }),
        image: fields.image({ label: 'Imagem', directory: 'public/images/competitions' }),
        content: fields.markdoc({ label: 'Conteúdo' }),
      },
    }),
    events: collection({
      label: 'Eventos',
      slugField: 'title',
      path: 'src/content/events/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        description: fields.text({ label: 'Descrição', multiline: true }),
        date: fields.date({ label: 'Data' }),
        time: fields.text({ label: 'Horário' }),
        location: fields.text({ label: 'Local' }),
        type: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Workshop', value: 'workshop' },
            { label: 'Palestra', value: 'talk' },
            { label: 'Networking', value: 'networking' },
            { label: 'Feira', value: 'fair' },
          ],
          defaultValue: 'workshop',
        }),
        featured: fields.checkbox({ label: 'Destacado', defaultValue: false }),
        image: fields.image({ label: 'Imagem', directory: 'public/images/events' }),
        content: fields.markdoc({ label: 'Conteúdo' }),
      },
    }),
  },
  singletons: {
    siteConfig: singleton({
      label: 'Configuração do Site',
      path: 'src/content/site-config.json',
      schema: {
        siteName: fields.text({ label: 'Nome do Site', defaultValue: 'Inovação Hub' }),
        tagline: fields.text({ label: 'Slogan', defaultValue: 'Conectando ideias, impulsionando negócios' }),
        description: fields.text({ label: 'Descrição', multiline: true }),
        contactEmail: fields.text({ label: 'Email de Contato' }),
        socialLinks: fields.object({
          linkedin: fields.text({ label: 'LinkedIn' }),
          twitter: fields.text({ label: 'Twitter' }),
          instagram: fields.text({ label: 'Instagram' }),
          youtube: fields.text({ label: 'YouTube' }),
        }),
        primaryColor: fields.text({ label: 'Cor Primária', defaultValue: '#0066CC' }),
        accentColor: fields.text({ label: 'Cor de Destaque', defaultValue: '#FF6B35' }),
      },
    }),
  },
});