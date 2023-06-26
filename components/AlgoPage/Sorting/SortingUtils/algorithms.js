import { MakeDelay } from "@/utils";
import { batch } from "react-redux";
import { store } from "@/redux/store";

import {
  incrementComparisons,
  incrementSwaps,
  setArray,
  setCompElements,
  setSwapElements,
  setSpecialElement,
  setMergeArr1,
  setMergeArr2,
  resetMergeArrays,
} from "@/redux/reducers/sortingSlice";

function generateArray(l, h) {
  let arr = [];
  for (let i = l; i <= h; i++) {
    arr.push(i);
  }
  return arr;
}

// Bubble Sort
export async function BubbleSort() {
  let array = store.getState().sorting.array.slice();
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (!store.getState().sorting.running) return;
      await MakeDelay(store.getState().sorting.speed);
      batch(() => {
        store.dispatch(setCompElements([j, j + 1]));
        store.dispatch(incrementComparisons());
      });
      array = store.getState().sorting.array.slice();
      if (array[j] > array[j + 1]) {
        store.dispatch(setSwapElements([j, j + 1]));
        let temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        store.dispatch(incrementSwaps());
        await MakeDelay(store.getState().sorting.speed);
      }
      batch(() => {
        store.dispatch(setSwapElements([-1, -1]));
        store.dispatch(setArray(array));
      });
    }
  }
}

// Selection Sort
export async function SelectionSort() {
  let array = store.getState().sorting.array.slice();
  for (let i = 0; i < array.length; i++) {
    let min = i;
    store.dispatch(setSpecialElement(min));
    for (let j = i + 1; j < array.length; j++) {
      if (!store.getState().sorting.running) return;
      store.dispatch(setCompElements([min, j]));
      await MakeDelay(store.getState().sorting.speed);
      if (array[j] < array[min]) {
        min = j;
      }
      batch(() => {
        store.dispatch(incrementComparisons());
        store.dispatch(setSwapElements([-1, -1]));
        store.dispatch(setCompElements([min, j]));
      });
    }
    array = store.getState().sorting.array.slice();
    store.dispatch(setSwapElements([i, min]));
    if (min !== i) {
      let temp = array[i];
      array[i] = array[min];
      array[min] = temp;
      store.dispatch(incrementSwaps());
      await MakeDelay(store.getState().sorting.speed);
    }
    batch(() => {
      store.dispatch(setSwapElements([-1, -1]));
      store.dispatch(setArray(array));
      store.dispatch(setSpecialElement(-1));
    });
  }
}

// Insertion Sort
export async function InsertionSort() {
  let array = store.getState().sorting.array.slice();
  for (let i = 1; i < array.length; i++) {
    let j = i;
    while (j > 0 && array[j] < array[j - 1]) {
      if (!store.getState().sorting.running) return;
      await MakeDelay(store.getState().sorting.speed);

      array = store.getState().sorting.array.slice();
      let temp = array[j];
      array[j] = array[j - 1];
      array[j - 1] = temp;
      batch(() => {
        store.dispatch(setCompElements([i, j]));
        store.dispatch(setSwapElements([j, j - 1]));
        store.dispatch(incrementComparisons());
        store.dispatch(incrementSwaps());
        store.dispatch(setArray(array));
      });
      j--;
    }
  }
}

// Merge Sort
export async function MergeSort() {
  let array = store.getState().sorting.array.slice();
  await MergeSortHelper(0, array.length - 1);
}
// Merge Sort Helper
async function MergeSortHelper(l, h) {
  if (!store.getState().sorting.running) return;
  if (l >= h) return;
  let mid = Math.floor((l + h) / 2);

  await MergeSortHelper(l, mid);
  await MergeSortHelper(mid + 1, h);
  batch(() => {
    store.dispatch(setMergeArr1([l, mid]));
    store.dispatch(setMergeArr2([mid + 1, h]));
  });
  await Merge(l, mid, h);
  store.dispatch(resetMergeArrays());
}
// Merge Function
async function Merge(l, mid, h) {
  let array = store.getState().sorting.array.slice();
  let i = l;
  let j = mid + 1;
  let k = l;
  let B = [];
  while (i <= mid && j <= h) {
    if (!store.getState().sorting.running) return;
    // await MakeDelay(store.getState().sorting.speed);
    batch(() => {
      store.dispatch(setCompElements([i, i]));
      store.dispatch(incrementComparisons());
    });
    if (array[i] < array[j]) {
      B[k++] = array[i++];
    } else {
      B[k++] = array[j++];
    }
  }
  for (; i <= mid; i++) {
    if (!store.getState().sorting.running) return;
    await MakeDelay(store.getState().sorting.speed);
    batch(() => {
      store.dispatch(setCompElements([i, i]));
      store.dispatch(incrementComparisons());
    });
    B[k++] = array[i];
  }
  for (; j <= h; j++) {
    if (!store.getState().sorting.running) return;
    await MakeDelay(store.getState().sorting.speed);
    batch(() => {
      store.dispatch(setCompElements([j, j]));
      store.dispatch(incrementComparisons());
    });
    B[k++] = array[j];
  }
  for (let i = l; i <= h; i++) {
    if (!store.getState().sorting.running) return;
    await MakeDelay(store.getState().sorting.speed);
    array = store.getState().sorting.array.slice();
    array[i] = B[i];
    batch(() => {
      store.dispatch(setSwapElements([i, i]));
      store.dispatch(incrementSwaps());
      store.dispatch(setArray(array));
    });
  }
}

// Quick Sort
export async function QuickSort() {
  let array = store.getState().sorting.array.slice();
  await QuickSortHelper(0, array.length - 1);
}
// Quick Sort Helper
async function QuickSortHelper(l, h) {
  if (!store.getState().sorting.running) return;
  if (l >= h) return;
  let j = await Partition(l, h);
  await QuickSortHelper(l, j - 1);
  await QuickSortHelper(j + 1, h);
}
// Partition Function
async function Partition(l, h) {
  let array = store.getState().sorting.array.slice();
  let pivot = array[l];
  let i = l;
  let j = h;
  while (i < j) {
    if (!store.getState().sorting.running) return;
    while (array[i] <= pivot) {
      if (!store.getState().sorting.running) return;
      await MakeDelay(store.getState().sorting.speed);
      batch(() => {
        store.dispatch(setCompElements([i, i]));
        store.dispatch(incrementComparisons());
      });
      i++;
    }
    while (array[j] > pivot) {
      if (!store.getState().sorting.running) return;
      await MakeDelay(store.getState().sorting.speed);
      batch(() => {
        store.dispatch(setCompElements([j, j]));
        store.dispatch(incrementComparisons());
      });
      j--;
    }
    if (i < j) {
      array = store.getState().sorting.array.slice();
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
      batch(() => {
        store.dispatch(setSwapElements([i, j]));
        store.dispatch(incrementSwaps());
        store.dispatch(setArray(array));
      });
    }
  }
  array = store.getState().sorting.array.slice();
  let temp = array[l];
  array[l] = array[j];
  array[j] = temp;
  batch(() => {
    store.dispatch(setSwapElements([l, j]));
    store.dispatch(incrementSwaps());
    store.dispatch(setArray(array));
  });
  return j;
}

// Heap Sort
export async function HeapSort() {
  let array = store.getState().sorting.array.slice();
  let n = array.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await Heapify(n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    if (!store.getState().sorting.running) return;
    array = store.getState().sorting.array.slice();
    let temp = array[0];
    array[0] = array[i];
    array[i] = temp;
    batch(() => {
      store.dispatch(setSwapElements([0, i]));
      store.dispatch(incrementSwaps());
      store.dispatch(setArray(array));
    });
    await Heapify(i, 0);
  }
}
// Heapify Function
async function Heapify(n, i) {
  let array = store.getState().sorting.array.slice();
  let largest = i;
  let l = 2 * i + 1;
  let r = 2 * i + 2;
  if (l < n) {
    if (!store.getState().sorting.running) return;
    await MakeDelay(store.getState().sorting.speed);
    batch(() => {
      store.dispatch(setCompElements([l, largest]));
      store.dispatch(incrementComparisons());
    });
    if (array[l] > array[largest]) {
      largest = l;
    }
  }
  if (r < n) {
    if (!store.getState().sorting.running) return;
    await MakeDelay(store.getState().sorting.speed);
    batch(() => {
      store.dispatch(setCompElements([r, largest]));
      store.dispatch(incrementComparisons());
    });
    if (array[r] > array[largest]) {
      largest = r;
    }
  }
  if (largest !== i) {
    array = store.getState().sorting.array.slice();
    let temp = array[i];
    array[i] = array[largest];
    array[largest] = temp;
    batch(() => {
      store.dispatch(setSwapElements([i, largest]));
      store.dispatch(incrementSwaps());
      store.dispatch(setArray(array));
    });
    await Heapify(n, largest);
  }
}

// Radix Sort
export async function RadixSort() {
  let array = store.getState().sorting.array.slice();
  let max = Math.max(...array);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    await CountingSort(exp);
  }
}

// Counting Sort
async function CountingSort(exp) {
  let array = store.getState().sorting.array.slice();
  let n = array.length;
  let output = new Array(n).fill(0);
  let count = new Array(10).fill(0);
  for (let i = 0; i < n; i++) {
    if (!store.getState().sorting.running) return;
    await MakeDelay(store.getState().sorting.speed);
    batch(() => {
      store.dispatch(setCompElements([i, i]));
      store.dispatch(incrementComparisons());
    });
    count[Math.floor(array[i] / exp) % 10]++;
  }
  for (let i = 1; i < 10; i++) {
    if (!store.getState().sorting.running) return;
    count[i] += count[i - 1];
  }
  for (let i = n - 1; i >= 0; i--) {
    if (!store.getState().sorting.running) return;
    await MakeDelay(store.getState().sorting.speed);
    batch(() => {
      store.dispatch(setCompElements([i, i]));
      store.dispatch(incrementComparisons());
    });
    output[count[Math.floor(array[i] / exp) % 10] - 1] = array[i];
    count[Math.floor(array[i] / exp) % 10]--;
  }
  for (let i = 0; i < n; i++) {
    if (!store.getState().sorting.running) return;
    await MakeDelay(store.getState().sorting.speed);
    array = store.getState().sorting.array.slice();
    array[i] = output[i];
    batch(() => {
      store.dispatch(setSwapElements([i, i]));
      store.dispatch(incrementSwaps());
      store.dispatch(setArray(array));
    });
  }
}