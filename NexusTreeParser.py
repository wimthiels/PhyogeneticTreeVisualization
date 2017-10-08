'''
Created on 5 Apr 2017

@author: Wim Thiels
'''


print("<START SCRIPT>")
import re
import sys
import numpy as np
import pandas as pd
from scipy import spatial

# from Bio import Phylo


#=========================================================================
# returns a map with key = tree number and value the raw tree in nexus format
#=========================================================================


def split_TreeFile_In_Trees(file):
    List_treeState_Lines = [
        line for line in open(file) if 'tree STATE' in line]
    pattern = re.compile(r'(?:tree STATE_)(\d+)(?:\s+= \[&R\]\s+)')
    TreeKeys = [pattern.search(row).group(1) for row in List_treeState_Lines]
    pattern = re.compile(r'(?:tree STATE_\d+\s+= \[&R\]\s+)(.*)')
    TreeValues = [pattern.search(row).group(1) for row in List_treeState_Lines]
    return {k: v for (k, v) in zip(TreeKeys, TreeValues)}

#=========================================================================
# returns a map with every leaf and node of every tree , along with it's distance to the nearest connection (upstream)
# the leaves represent the species
# key =  treeID + L or N + leaf or nodename
# eg : 34000N4a     34000L5
#=========================================================================


def make_map_idx_leaf_nodes(map_RawTrees):
    # general init
    map_Leaf_Node_Distance = {}
    pattern_leaf = re.compile(r'\d:')
    pattern_node = re.compile(r'\):')

    # iterate over every tree
    for tree_ID in map_RawTrees.keys():
        # init per tree
        curr_tree = map_RawTrees.get(tree_ID)
        ctr_depth = 0
        ls_depth = ['R']

        # iterate over the whole tree character by character
        for i in range(len(curr_tree)):
            # detect depth
            if curr_tree[i] == '(':
                ctr_depth += 1
                if (len(ls_depth) - 1 < ctr_depth):
                    ls_depth.append('a')
                else:
                    ls_depth[ctr_depth] = chr(ord(ls_depth[ctr_depth]) + 1)
            elif curr_tree[i] == ')':
                old_depth = str(ctr_depth) + ls_depth[ctr_depth]
                ctr_depth -= 1

            # find a leaf or node with the corresponding distance
            if i + 2 <= len(curr_tree):
                searchFrame = curr_tree[i:i + 2]
            if pattern_leaf.match(searchFrame) or pattern_node.match(searchFrame):
                if pattern_leaf.match(searchFrame):
                    key = tree_ID + 'L' + searchFrame[0]
                if pattern_node.match(searchFrame):
                    # a node is identified by the level at which it occurs
                    key = tree_ID + 'N' + old_depth
                value = (float(re.split('[,)]', curr_tree[i + 2:])
                               [0]), str(ctr_depth) + ls_depth[ctr_depth])
                map_Leaf_Node_Distance[key] = value

    return map_Leaf_Node_Distance

#=========================================================================
# get the path from the leaves , over all the nodes, to the root
# eg. ['bonobo', '5a', '4a', '3a', '2a', '1a'] is path1'
#=========================================================================


def get_tree_path(treeID, map_Leaf_Node_Distance, species):
    ls_breadcrumb_species = [map_names.get(species)]
    treePos = species
    treeKey = treeID + 'L' + species
    while treePos != '1a':
        treePos = map_Leaf_Node_Distance.get(treeKey)[1]
        treeKey = treeID + 'N' + treePos
        ls_breadcrumb_species.append(treePos)
    return ls_breadcrumb_species

#=========================================================================
# get the evolutionary distance between two current species''
#=========================================================================


def get_evol_distance(treeID, map_Leaf_Node_Distance, species1, species2):
    if species1 == species2:
        return 0
    path1 = get_tree_path(treeID, map_Leaf_Node_Distance, species1)
    path2 = get_tree_path(treeID, map_Leaf_Node_Distance, species2)
#     if treeID == '0':
#         print(str(path1) + ' is path1')
#         print(str(path2) + ' is path2 ')
    treeKey = treeID + 'L' + species2
    sum_dist = map_Leaf_Node_Distance.get(treeKey)[0]
    while (map_Leaf_Node_Distance.get(treeKey)[1] not in path1):
        treeKey = treeID + 'N' + map_Leaf_Node_Distance.get(treeKey)[1]
        sum_dist += map_Leaf_Node_Distance.get(treeKey)[0]
    evol_distance = sum_dist * 2

    return evol_distance

#=========================================================================
# make a map with key = treeID and as value a list with 6 elements.
# every element in the list is the average evolutionary  distance for a species (so sum of 5 distances/5)
#=========================================================================


def make_map_avg_dist_per_species(map_Leaf_Node_Distance):
    map_avg_dist = {}
    for treeID in ls_treeIDs:
        map_avg_dist[treeID] = []
        for species1 in range(1, 7):
            sum_dist = 0
            ctr = 0
            for species2 in range(1, 7):
                if species1 == species2:
                    continue
                ctr += 1
                sum_dist += get_evol_distance(treeID, map_Leaf_Node_Distance,
                                              str(species1), str(species2))
            map_avg_dist[treeID].append(sum_dist / ctr)
    return map_avg_dist


def write_map_avg_dist_per_species(map_names, mapAvgDist):
    apenames = map_names.values()
    data = np.matrix(np.reshape(list(mapAvgDist.values()), (101, 6)))
    df = pd.DataFrame(data, index=mapAvgDist.keys(), columns=apenames)
    df.to_csv('apetree_avg_dist_per_species.csv',
              index=True, header=True, sep=',')


#=========================================================================
# based on the average distance vector that every tree has, calculate the cosine distance
# for every pair of trees;  Result is a 101x101 matrix
#=========================================================================


def make_cosine_distance_map(mapAvgDist):
    ls_treeIDs = mapAvgDist.keys()
    ls_avgDist = [spatial.distance.cosine(
        mapAvgDist[treeId1], mapAvgDist[treeId2]) for treeId1 in ls_treeIDs for treeId2 in ls_treeIDs]
    cos_dist_matrix = np.matrix(np.reshape(ls_avgDist, (101, 101)))
    df = pd.DataFrame(cos_dist_matrix, index=ls_treeIDs, columns=ls_treeIDs)
    df.to_csv('apetree_cosine_distance.csv', index=True, header=True, sep=',')


##########################################################################
#MAIN#####################################################################
##########################################################################


# STEP 1 :
# parse the file into different trees


numArgs = len(sys.argv) - 1
# filename can be given by the user as second argument
if (numArgs > 1 and sys.argv[2]):
    file = sys.argv[2]
else:
    file = 'ape.tree'

map_names = {'1': 'bonobo', '2': 'chimp', '3': 'gorilla',
             '4': 'human', '5': 'orangutan', '6': 'siamang'}

map_NexusTree_RawTrees = split_TreeFile_In_Trees(file)
ls_treeIDs = map_NexusTree_RawTrees.keys()
map_Leaf_Node_Distance = make_map_idx_leaf_nodes(map_NexusTree_RawTrees)

print(map_NexusTree_RawTrees.get('0'))
# print(get_tree_path('0', map_Leaf_Node_Distance, '5'))
# print(map_Leaf_Node_Distance.get('0L6'))
# print('evol dist=' + str(get_evol_distance('0', map_Leaf_Node_Distance, '1', '5')))

# print('evol dist=' + str(get_evol_distance('0', map_Leaf_Node_Distance, '5', '1')))
# print('evol dist=' + str(get_evol_distance('0', map_Leaf_Node_Distance, '5', '2')))
# print('evol dist=' + str(get_evol_distance('0', map_Leaf_Node_Distance, '5', '3')))
# print('evol dist=' + str(get_evol_distance('0', map_Leaf_Node_Distance, '5', '4')))
# print('evol dist=' + str(get_evol_distance('0', map_Leaf_Node_Distance, '5', '5')))
print('outlier 9000>>>' + str(map_Leaf_Node_Distance.keys()))
print('evol dist=' + str(get_evol_distance('0', map_Leaf_Node_Distance, '4', '5')))
mapAvgDist = make_map_avg_dist_per_species(map_Leaf_Node_Distance)
print(mapAvgDist['0'])


write_map_avg_dist_per_species(map_names, mapAvgDist)

make_cosine_distance_map(mapAvgDist)
