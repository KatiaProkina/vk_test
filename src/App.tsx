import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Group {
  id: number;
  name: string;
  closed: boolean;
  avatar_color?: string;
  members_count: number;
  friends?: User[];
}

interface User {
  first_name: string;
  last_name: string;
}

interface GetGroupsResponse {
  result: 1 | 0;
  data?: Group[];
}

const App: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<{
    [groupId: number]: boolean;
  }>({});
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    privacy: 'all',
    avatarColor: 'all',
    hasFriends: 'all',
  });

  useEffect(() => {
    setTimeout(() => {
      const fetchGroups = async () => {
        try {
          const response = await axios.get<GetGroupsResponse[]>(
            '../groups.json'
          );
          setGroups(response.data);
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        }
      };

      fetchGroups();
    }, 1000);
  }, []);

  const toggleFriends = (groupId: number) => {
    setExpandedGroups((prevState) => ({
      ...prevState,
      [groupId]: !prevState[groupId],
    }));
  };
  useEffect(() => {
    let filteredGroups = groups.filter((group) => {
      if (
        filterOptions.privacy === 'all' ||
        (filterOptions.privacy === 'closed' && group.closed) ||
        (filterOptions.privacy === 'open' && !group.closed)
      ) {
        if (
          filterOptions.avatarColor === 'all' ||
          filterOptions.avatarColor === group.avatar_color
        ) {
          if (
            filterOptions.hasFriends === 'all' ||
            (filterOptions.hasFriends === 'yes' &&
              group.friends &&
              group.friends.length > 0) ||
            (filterOptions.hasFriends === 'no' &&
              (!group.friends || group.friends.length === 0))
          ) {
            return true;
          }
        }
      }
      return false;
    });
    setFilteredGroups(filteredGroups);
  }, [groups, filterOptions]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilterOptions((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div>
      <h1>Группы</h1>
      <div className="filters">
        <label>Приватность</label>
        <select
          name="privacy"
          value={filterOptions.privacy}
          onChange={handleFilterChange}>
          <option value="all">Все</option>
          <option value="closed">Закрытая</option>
          <option value="open">Открытая</option>
        </select>
        <label>Цвет аватара:</label>
        <select
          name="avatarColor"
          value={filterOptions.avatarColor}
          onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="red">Красный</option>
          <option value="green">Зеленый</option>
          <option value="blue">Синий</option>
          <option value="yellow">Желтый</option>
          <option value="purple">Фиолетовый</option>
          <option value="white">Белый</option>
          <option value="orange">Оранжевый</option>
        </select>
        <label>Друзья в группе:</label>
        <select
          name="hasFriends"
          value={filterOptions.hasFriends}
          onChange={handleFilterChange}>
          <option value="all">Все</option>
          <option value="yes">Да</option>
          <option value="no">Нет</option>
        </select>
      </div>
      <div className="groups">
        {filteredGroups.map((group) => (
          <div key={group.id} className="group-item">
            <div>{group.name}</div>
            {group.avatar_color && (
              <div
                className="group-avatar"
                style={{
                  backgroundColor: group.avatar_color,
                }}></div>
            )}
            <div>Тип:{group.closed ? 'Closed' : 'Open'}</div>
            <div>Участники:{group.members_count}</div>
            {group.friends && (
              <div>
                Друзья:{' '}
                <button
                  className="friend-count"
                  onClick={() => toggleFriends(group.id)}>
                  {group.friends.length}
                </button>
                {expandedGroups[group.id] && (
                  <ul>
                    {group.friends.map((friend, index) => (
                      <li key={index}>
                        {friend.first_name} {friend.last_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
