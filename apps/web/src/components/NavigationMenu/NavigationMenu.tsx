import { Button, Dropdown, Menu, Space, type MenuProps } from "@/components/StyledComponents";
import { DownOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';


const items: MenuProps['items'] = [
  {
    key: '1',
    label: 'Profile',
  },
  {
    key: '2',
    label: 'Settings',
    icon: <SettingOutlined />,
  },
  {
    type: 'divider',
  },
  {
    key: '3',
    label: 'Logout',
    icon: <LogoutOutlined />,
    danger: true,
  },
];
    

const sharedProps = {
  menu: {
    items: items,
  },
};

export interface NavigationMenuProps {
  children: React.ReactNode;
}

export const NavigationMenu = ({children}: NavigationMenuProps) => {
  return (
        <Dropdown {...sharedProps} trigger={['click']}>
          <span >
            <span style={{ pointerEvents: "none" }}>

            {children}
            </span>
            </span>
        </Dropdown>
  );
} 