// Central data model for the rack cabinet. Each "unit" is one rack-mounted
// device that maps to a skill category. Order = top -> bottom in the cabinet.
// Tech names are intentionally NOT translated; descriptions come from i18n.

export const UNITS = [
  {
    id: 'servers',
    icon: '🖥️',
    accent: '#22e3a6',
    led: '#22e3a6',
    type: 'server', // 2U server with drive bays
    u: 2,
    items: ['Windows Server', 'Linux', 'VMware', 'Proxmox'],
  },
  {
    id: 'network',
    icon: '🌐',
    accent: '#36c5ff',
    led: '#36c5ff',
    type: 'switch', // 2U 48-port core switch
    u: 2,
    items: ['Fortinet', 'VLAN', 'VPN', 'Routing'],
  },
  {
    id: 'kubernetes',
    icon: '☸️',
    accent: '#6e8cff',
    led: '#6e8cff',
    type: 'blade', // blade chassis
    u: 2,
    items: ['Rancher', 'Docker', 'Longhorn', 'CI/CD'],
  },
  {
    id: 'databases',
    icon: '🗄️',
    accent: '#ffb454',
    led: '#ffb454',
    type: 'storage', // storage array
    u: 2,
    items: ['Oracle', 'SQL Server', 'PostgreSQL', 'Redis', 'MongoDB'],
  },
  {
    id: 'software',
    icon: '💻',
    accent: '#c77dff',
    led: '#c77dff',
    type: 'server',
    u: 2,
    items: ['.NET', 'React', 'React Native', 'API'],
  },
  {
    id: 'security',
    icon: '🔒',
    accent: '#ff5d73',
    led: '#ff5d73',
    type: 'firewall', // 2U security appliance
    u: 2,
    items: ['PAM', 'QRadar', 'SIEM', 'IAM'],
  },
]
