import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "@tanstack/react-router";
import {
  FiBriefcase,
  FiHome,
  FiSettings,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import type { IconType } from "react-icons/lib";

import type { UserPublic } from "@/client";

const items = [
  { icon: FiHome, title: "首页", path: "/" },
  { icon: FiBriefcase, title: "添加项目", path: "/items" },
  { icon: FiSettings, title: "用户设置", path: "/settings" },
  { icon: FiUsers, title: "管理员", path: "/admin" },
  { icon: FiUsers, title: "老师管理", path: "/teachers" },
  { icon: FiBookOpen, title: "学科管理", path: "/subjects" },
  { icon: FiUsers, title: "学生管理", path: "/students" },
  { icon: FiCalendar, title: "课表管理", path: "/schedules" },
  { icon: FiClock, title: "课程管理", path: "/courses" },
];

interface SidebarItemsProps {
  onClose?: () => void;
}

interface Item {
  icon: IconType;
  title: string;
  path: string;
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);

  const finalItems: Item[] = currentUser?.is_superuser ? [...items] : items;

  const listItems = finalItems.map(({ icon, title, path }) => (
    <RouterLink key={title} to={path} onClick={onClose}>
      <Flex
        gap={4}
        px={4}
        py={2}
        _hover={{
          background: "gray.subtle",
        }}
        alignItems="center"
        fontSize="sm"
      >
        <Icon as={icon} alignSelf="center" />
        <Text ml={2}>{title}</Text>
      </Flex>
    </RouterLink>
  ));

  return (
    <>
      <Text fontSize="18px" px={4} py={2} fontWeight="bold">
        菜单
      </Text>
      <Box>{listItems}</Box>
    </>
  );
};

export default SidebarItems;
