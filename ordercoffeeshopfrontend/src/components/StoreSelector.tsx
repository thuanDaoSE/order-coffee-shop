import { useAuth } from '../contexts/AuthContext';
import { useStores } from '../hooks/useStores';

const StoreSelector = () => {
  const { user, updateStore } = useAuth();
  const { stores, isLoading, error } = useStores();

  const handleStoreChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = parseInt(event.target.value, 10);
    if (!isNaN(storeId)) {
      await updateStore(storeId);
      // Maybe show a toast notification for success
    }
  };

  if (!user || isLoading || error) {
    return null; // Don't render if not logged in, loading, or if there's an error
  }

  return (
    <div className="flex items-center space-x-2">
      <select
        value={user.store?.id || ''}
        onChange={handleStoreChange}
        className="bg-amber-800 text-white rounded-md p-2 text-sm"
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StoreSelector;
