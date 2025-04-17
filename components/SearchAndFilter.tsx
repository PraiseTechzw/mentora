import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from './SearchBar';

export type FilterOption = {
  id: string;
  label: string;
  value: string;
};

export type SortOption = {
  id: string;
  label: string;
  value: string;
};

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  onSortChange: (sort: string) => void;
  activeFilters: string[];
  activeSort: string;
  filterOptions: FilterOption[];
  sortOptions: SortOption[];
  placeholder?: string;
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  onFilterChange,
  onSortChange,
  activeFilters,
  activeSort,
  filterOptions,
  sortOptions,
  placeholder = "Search for topics, courses, or instructors"
}: SearchAndFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const handleFilterToggle = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(id => id !== filterId)
      : [...activeFilters, filterId];
    onFilterChange(newFilters);
  };

  const handleSortSelect = (sortId: string) => {
    onSortChange(sortId);
    setShowSort(false);
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.filterList}>
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterOption,
                  activeFilters.includes(filter.id) && styles.filterOptionActive
                ]}
                onPress={() => handleFilterToggle(filter.id)}
              >
                <Text style={[
                  styles.filterOptionText,
                  activeFilters.includes(filter.id) && styles.filterOptionTextActive
                ]}>
                  {filter.label}
                </Text>
                {activeFilters.includes(filter.id) && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                onFilterChange([]);
                setShowFilters(false);
              }}
            >
              <Text style={styles.modalButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={() => setShowFilters(false)}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSort}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSort(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <TouchableOpacity onPress={() => setShowSort(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.sortList}>
            {sortOptions.map((sort) => (
              <TouchableOpacity
                key={sort.id}
                style={[
                  styles.sortOption,
                  activeSort === sort.id && styles.sortOptionActive
                ]}
                onPress={() => handleSortSelect(sort.id)}
              >
                <Text style={[
                  styles.sortOptionText,
                  activeSort === sort.id && styles.sortOptionTextActive
                ]}>
                  {sort.label}
                </Text>
                {activeSort === sort.id && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={placeholder}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={24} color="#666" />
          {activeFilters.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilters.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSort(true)}
        >
          <Ionicons name="swap-vertical-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {activeFilters.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersContainer}
        >
          {activeFilters.map((filterId) => {
            const filter = filterOptions.find(f => f.id === filterId);
            return filter ? (
              <View key={filterId} style={styles.activeFilter}>
                <Text style={styles.activeFilterText}>{filter.label}</Text>
                <TouchableOpacity
                  onPress={() => handleFilterToggle(filterId)}
                  style={styles.activeFilterRemove}
                >
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ) : null;
          })}
        </ScrollView>
      )}

      {renderFilterModal()}
      {renderSortModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  activeFilterRemove: {
    padding: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  filterList: {
    maxHeight: 400,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F2F2F7',
  },
  filterOptionActive: {
    backgroundColor: '#E5E5EA',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  filterOptionTextActive: {
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: '#fff',
  },
  sortList: {
    maxHeight: 400,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F2F2F7',
  },
  sortOptionActive: {
    backgroundColor: '#E5E5EA',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  sortOptionTextActive: {
    fontWeight: '600',
  },
}); 