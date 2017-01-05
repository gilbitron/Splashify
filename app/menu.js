const {app, Menu} = require('electron');

const template = [
  {
    label: 'View',
    submenu: [
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Splashify Website',
        click () { require('electron').shell.openExternal('https://splashify.net') }
      },
      {
        label: 'Report an Issue...',
        click () { require('electron').shell.openExternal('https://github.com/gilbitron/Splashify/issues/new') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
  // Window menu.
  template[2].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]

  if (process.env.NODE_ENV === 'development') {
      // View menu.
      template[1].submenu.push(
        {
          type: 'separator'
        },
        {
          role: 'reload'
        },
        {
          role: 'toggledevtools'
        }
      )
  }
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
