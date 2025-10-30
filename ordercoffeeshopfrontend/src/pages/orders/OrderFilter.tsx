import React from 'react';

interface OrderFilterProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { name: string; statuses: string[] }[];
}

const OrderFilter: React.FC<OrderFilterProps> = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex space-x-6 overflow-x-auto justify-evenly">
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.name
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OrderFilter;
