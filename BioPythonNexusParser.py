'''
Created on 8 Apr 2017
#https://bmcbioinformatics.biomedcentral.com/articles/10.1186/1471-2105-13-209
#http://biopython.org/wiki/Phylo
@author: Administrator
'''
from Bio import Phylo
import numpy as np
import pandas as pd
from Bio.Phylo.Consensus import *
import networkx
import pylab
import statistics


# get iterator over a tree


def fool_around_with_trees():
    trees = Phylo.parse('ape.tree', 'nexus')
    for tree in trees:
        if tree.name == 'STATE_0':
            print('success')
            tree_state0 = tree

    print(tree_state0.get_path('human'))
    print('total_branch length=>' + str(tree_state0.total_branch_length()))
    print('depths=>' + str(tree_state0.depths()))
    print('distance human urangutan=>' + str(tree_state0.distance('human',
                                                                  'orangutan')))  # OK matches met mijn berekeningen !

    # draw a tree /works
    tree_state0.ladderize()
    Phylo.draw(tree_state0)

    # nicer graph / doesn't work
    # import pylab
    # Phylo.draw_graphviz(tree_state0)
    # pylab.show()

    # ASCII tree /works
    Phylo.draw_ascii(tree_state0)

    # network graph : works, but not a clear figure

    net = Phylo.to_networkx(tree_state0)
    networkx.draw(net)
    pylab.show()

    # doesn't work
    # from io import StringIO
    # treedata = '[&R] ((5:0.04847887618847128,(3:0.03189934232093919,((2:0.011076861832266626,1:0.011076861832266626):0.009810542752873795,4:0.02088740458514042):0.011011937735798769):0.01657953386753209):0.017232517763959114,6:0.06571139395243039);'
    # handle = StringIO(treedata)
    # tree = Phylo.read(handle, 'nexus')

    # conensus trees / works, not very informative

    trees = list(Phylo.parse('ape.tree', 'nexus'))
    strict_tree = strict_consensus(trees)
    majority_tree = majority_consensus(trees, 0.5)
    adam_tree = adam_consensus(trees)
    #
    Phylo.draw(strict_tree)
    Phylo.draw(majority_tree)
    Phylo.draw(adam_tree)

    # ok werkt ! path van human -> root (4 nodes, of clades zoals het hier
    # wordt genoemd)
    return()

# MAKE FILE CSV for P5####################################################
# make map of trees


def make_mat_comp_evol_dist(tree1, tree2):
    mat_dist_compare = []
    ctr_row = 0
    for ls_species in [[i, j] for i in map_names.keys() for j in map_names.keys() if j > i]:
        species1 = map_names.get(ls_species[0])
        species2 = map_names.get(ls_species[1])
        row = []
        row.append(species1)  # column1 species1
        row.append(species2)  # column1 species2
        row.append(map_apetree.get(tree1).distance(
            species1, species2))  # dist tree1
        row.append(map_apetree.get(tree2).distance(
            species1, species2))  # dist tree2
        row.append(row[2] - row[3])  # delta
        row.append(0)  # redundancy ic
        mat_dist_compare.append(row)
#         print(mat_dist_compare[ctr_row])
        ctr_row += 1

        # also add the mirrordistance (and indicate it is redundant) = handy
        # for diagram
        row = []
        row.append(species2)  # column1 species1
        row.append(species1)  # column1 species2
        row.append(map_apetree.get(tree1).distance(
            species1, species2))  # dist tree1
        row.append(map_apetree.get(tree2).distance(
            species1, species2))  # dist tree2
        row.append(row[2] - row[3])  # delta
        row.append(1)  # redundancy ic
        mat_dist_compare.append(row)
#         print(mat_dist_compare[ctr_row])
        ctr_row += 1

    # sort on 2 fields !
    return sorted(mat_dist_compare, key=lambda x: (x[4], x[0]))


def make_avg_dist_6vector_foratree(map_apetree, treename):
    tree = map_apetree.get(treename)
    ls_6vector = [0 for _ in range(0, len(map_names))]
    ls_6vector_count = [0 for _ in range(0, len(map_names))]
    for ls_species in [[i, j] for i in map_names.keys() for j in map_names.keys() if j > i]:
        species1 = map_names.get(ls_species[0])
        species2 = map_names.get(ls_species[1])
        dist = tree.distance(species1, species2)
        ls_6vector[int(ls_species[0]) - 1] += dist
        ls_6vector[int(ls_species[1]) - 1] += dist
        ls_6vector_count[int(ls_species[0]) - 1] += 1
        ls_6vector_count[int(ls_species[1]) - 1] += 1

    return [ls_6vector[i] / ls_6vector_count[i] for i in range(0, 6)]


def make_mat_avg_dist_per_species(mat_comp_evol_dist):
    mat_avg_dist_per_species = []

    for species in map_names.values():
        ctr_dist_tree1 = 0
        ctr_dist_tree2 = 0
        ctr_rowN = 0
        for row in mat_comp_evol_dist:
            if (row[0] == species or row[1] == species):
                ctr_rowN += 1
                ctr_dist_tree1 += row[2]
                ctr_dist_tree2 += row[3]
                print(ctr_rowN, ctr_dist_tree1, ctr_dist_tree2)
        rowN = []
        rowN.append(species)
        rowN.append('*')
        rowN.append(ctr_dist_tree1 / ctr_rowN)
        rowN.append(ctr_dist_tree2 / ctr_rowN)
        rowN.append(rowN[2] - rowN[3])
        rowN.append(0)
        mat_avg_dist_per_species.append(rowN)

    return sorted(mat_avg_dist_per_species, key=lambda x: (x[4], x[0]))


def write_csv_evol_dist(matDist, matAvg, treename1, treename2):
    ls_indexDf = [map_names_abbrev.get(row[0]) + map_names_abbrev.get(row[1])
                  for row in matDist] + [map_names_abbrev.get(row[0]) + map_names_abbrev.get(row[1]) for row in matAvg]
    ls_columnsDf = ['sp1', 'sp2', 'dist' +
                    treename1, 'dist' + treename2, 'delta', 'redundIC']
    # het moet een echt matrix object zijn, dus niet
    data = np.matrix(matDist + matAvg)
    df = pd.DataFrame(data, index=ls_indexDf, columns=ls_columnsDf)
    filename = 'compare_dist_' + treename1 + treename2 + '.csv'
    df.to_csv(filename, index=True, header=True, sep=',')
    return df


def write_csv_101_trees(ls_records):
    ls_indexDf = [record[0] for record in ls_records]
    ls_columnsDf = ls_columns_df_101comp
    data = np.matrix(ls_records)
    df = pd.DataFrame(data, index=ls_indexDf, columns=ls_columnsDf)
    filename = 'compare_dist_101Trees.csv'
    df.to_csv(filename, index=True, header=True, sep=',')
    return df


def make_map_trees_101(ls_columns, map_apetree):
    map_avg_dist_tree = {}
    counter = [0, 0, 0]
    distidx = ls_columns_df_101comp.index('distB')
    for tree in map_apetree.values():
        ls_value_tree = []
#         ls_value_tree.append(tree)
        ls_value_tree.append(tree.name)
        ls_dist = make_avg_dist_6vector_foratree(map_apetree, tree.name)
        for i in range(0, 6):
            ls_value_tree.append(ls_dist[i])
        for i in range(0, 6):
            ls_value_tree.append(0)

        HSlen = tree.distance('human', 'siamang')
        HOlen = tree.distance('human', 'orangutan')
        SOlen = tree.distance('orangutan', 'siamang')
        if (HSlen > HOlen):
            ls_value_tree.append('I')
            counter[0] += 1
            if counter[0] < 9:  # algoritme obv sketch figuur
                ls_value_tree.append(counter[0])
                ls_value_tree.append(3)
            else:
                if ((counter[0] - 8) % 10) == 0:
                    ls_value_tree.append(10)
                    ls_value_tree.append(3 + int((counter[0] - 8) / 10))
                else:
                    ls_value_tree.append((counter[0] - 8) % 10)
                    ls_value_tree.append(4 + int((counter[0] - 8) / 10))
        elif (HOlen > HSlen):
            ls_value_tree.append('II')
            counter[1] += 1
            if counter[1] < 11:  # algoritme obv sketch figuur
                ls_value_tree.append(counter[1])
                ls_value_tree.append(1)
            else:
                ls_value_tree.append(counter[1] - 10)
                ls_value_tree.append(2)
        elif (HSlen == HOlen and HSlen > SOlen):
            ls_value_tree.append('III')
            counter[2] += 1
            if counter[2] < 4:  # algoritme obv sketch figuur
                ls_value_tree.append(7 + counter[2])
                ls_value_tree.append(2)
            else:
                ls_value_tree.append(5 + counter[2])
                ls_value_tree.append(3)
#         ls_value.tree.append()
        ls_value_tree.append(3)
        ls_value_tree.append(1)
        ls_value_tree.extend([0, 0, 0, 0, 0, 0])  # sd's
        ls_value_tree.append(sum(ls_value_tree[distidx:distidx + 6]))
        map_avg_dist_tree[tree.name] = ls_value_tree

    return map_avg_dist_tree


def make_agg_dist_6vector_foragroup(mapAvgDist):
    map_agg_dist = {}
    groupICidx = ls_columns_df_101comp.index('groupIC')
    distidx = ls_columns_df_101comp.index('distB')

    # calculate sd and mean and sum for every group and every species over trees
    # list : level 1 = 3 groups //level 2 = 6 species //level 3 = Trees in
    # that group //value = distance
    ls_dist_groups = []
    for group in range(0, 4):  # last group is the total!
        ls_dist_species = []
        for sp in range(0, len(map_names)):
            if group == 3:
                ls_dist_species.append([treevector[distidx + sp]
                                        for treevector in mapAvgDist.values()])
            else:
                ls_dist_species.append([treevector[distidx + sp]
                                        for treevector in mapAvgDist.values() if treevector[groupICidx] == map_NumToGroup.get(group)])

        ls_dist_groups.append(ls_dist_species)

    ls_stat_groups = []  # list : level 1 = 3 groups // level 2 = 6 species // level 3 stats= [0=mean, 1=sd , 2=sum] =>  value = statistic over trees
    for group in range(0, 4):  # last group is the total
        ls_stat_species = []
        for sp in range(0, len(map_names)):
            ls_stat_stats = []
            ls_stat_stats.append(statistics.mean(ls_dist_groups[group][sp]))
            ls_stat_stats.append(statistics.stdev(ls_dist_groups[group][sp]))
            ls_stat_stats.append(sum(ls_dist_groups[group][sp]))
            ls_stat_species.append(ls_stat_stats)
        ls_stat_groups.append(ls_stat_species)

    # map to record in the csv record format, 1 for every group
    for groupIdx in range(0, 4):
        ls_value_tree = []
        ls_value_tree.append('Group' + map_NumToGroup.get(groupIdx))
        for sp in range(0, 6):
            ls_value_tree.append(ls_stat_groups[groupIdx][sp][0])
        for sp in range(0, 6):
            delta = ls_stat_groups[groupIdx][sp][0] - \
                ls_stat_groups[map_groupToNum['TOTAL']][sp][0]
            ls_value_tree.append(delta)

        if groupIdx == map_groupToNum['TOTAL']:
            ls_value_tree.append('-')
        else:
            ls_value_tree.append('TOT')

        if groupIdx == map_groupToNum['I']:
            ls_value_tree.append(5.5)
            ls_value_tree.append(6.5)
            ls_value_tree.append(2)
            ls_value_tree.append(6)
        elif groupIdx == map_groupToNum['II']:
            ls_value_tree.append(4.5)
            ls_value_tree.append(1.5)
            ls_value_tree.append(2)
            ls_value_tree.append(2)
        elif groupIdx == map_groupToNum['III']:
            ls_value_tree.append(9.5)
            ls_value_tree.append(2.5)
            ls_value_tree.append(2)
            ls_value_tree.append(2)
        elif groupIdx == map_groupToNum['TOTAL']:
            ls_value_tree.append(5.5)
            ls_value_tree.append(5.5)
            ls_value_tree.append(1)
            ls_value_tree.append(10)  # scaling

        for sp in range(0, 6):   # add sd
            ls_value_tree.append(ls_stat_groups[groupIdx][sp][1])

        ls_value_tree.append(sum(ls_value_tree[distidx:distidx + 6]))

        map_agg_dist[ls_value_tree[0]] = ls_value_tree  # add record to list

    return map_agg_dist


def updateGridXGridY(listOutputRec):
    idxGridX = ls_columns_df_101comp.index('GridX')
    idxGridY = ls_columns_df_101comp.index('GridY')
    idxgroupIC = ls_columns_df_101comp.index('groupIC')
    counter = [0, 0, 0]
    ls_update = []

    for rec in listOutputRec:
        if (rec[idxgroupIC] == 'I'):
            counter[0] += 1
            if counter[0] < 9:  # algoritme obv sketch figuur
                rec[idxGridX] = counter[0]
                rec[idxGridY] = 3
            else:
                if ((counter[0] - 8) % 10) == 0:
                    rec[idxGridX] = 10
                    rec[idxGridY] = 3 + int((counter[0] - 8) / 10)
#
#                     ls_value_tree.append(10)
#                     ls_value_tree.append(3 + int((counter[0] - 8) / 10))
                else:
                    rec[idxGridX] = (counter[0] - 8) % 10
                    rec[idxGridY] = 4 + int((counter[0] - 8) / 10)
#                     ls_value_tree.append((counter[0] - 8) % 10)
#                     ls_value_tree.append(4 + int((counter[0] - 8) / 10))
        elif (rec[idxgroupIC] == 'II'):
            counter[1] += 1
            if counter[1] < 11:  # algoritme obv sketch figuur
                rec[idxGridX] = counter[1]
                rec[idxGridY] = 1
#                 ls_value_tree.append(counter[1])
#                 ls_value_tree.append(1)
            else:
                rec[idxGridX] = counter[1] - 10
                rec[idxGridY] = 2
#                 ls_value_tree.append(counter[1] - 10)
#                 ls_value_tree.append(2)
        elif (rec[idxgroupIC] == 'III'):
            counter[2] += 1
            if counter[2] < 4:  # algoritme obv sketch figuur
                rec[idxGridX] = 7 + counter[2]
                rec[idxGridY] = 2
#                 ls_value_tree.append(7 + counter[2])
#                 ls_value_tree.append(2)
            else:
                rec[idxGridX] = 5 + counter[2]
                rec[idxGridY] = 3

        ls_update.append(rec)
#                 ls_value_tree.append(5 + counter[2])
#                 ls_value_tree.append(3)
#

    return ls_update


#########################################################################
# MAIN
##########################################################################
executeCompareTwoTrees = True

trees = Phylo.parse('ape.tree', 'nexus')

map_names = {'1': 'bonobo', '2': 'chimp', '3': 'gorilla',
             '4': 'human', '5': 'orangutan', '6': 'siamang'}

map_names_abbrev = {'bonobo': 'B', 'chimp': 'C', 'gorilla': 'G',
                    'human': 'H', 'orangutan': 'O', 'siamang': 'S', '*': '*'}

map_apetree = {tree.name: tree for tree in Phylo.parse('ape.tree', 'nexus')}

map_groupToNum = {'I': 0, 'II': 1, 'III': 2, 'TOTAL': 3}
map_NumToGroup = {0: 'I', 1: 'II', 2: 'III', 3: 'TOTAL'}

# COMPARE TWO TREES
###########################################################
if (executeCompareTwoTrees):
    print([str(row[4]) + "\n"
           for row in make_mat_comp_evol_dist('STATE_0', 'STATE_23000')])

    mat1 = make_mat_comp_evol_dist('STATE_0', 'STATE_23000')
    mat2 = make_mat_avg_dist_per_species(mat1)
    print("\n".join([str(x) for x in mat2]))

    print('print mat 1' + str(mat1))
    print('print mat 2' + str(mat2))
    write_csv_evol_dist(mat1, mat2, 'STATE_0', 'STATE_23000')

# COMPARE 101 TREES
#################################################################

# step1 : make the list of attributes (columns) of our eventual dataframe
# id = tree of groupI of TOTal
# dist = absolute distance
# dddist = delta between total average
# groupIC = I= siamang eerst, II = orang eerst, III = siaman en orang samen , IV = 3split (??)
# viewIC = 1,2,3 :show in that view :  1 = total view, 2=subgroup view, 3 = detailview
# grid = grid of 10X10 + 1 on screen
# scalefactor = normally 1, if more room scale (based on biggest square
# you can make, or just manual
ls_columns_df_101comp = ['ID', 'distB', 'distC', 'distG', 'distH', 'distO', 'distS', 'ddistB',
                         'ddistC', 'dddistG', 'ddistH', 'ddistO', 'ddistS', 'groupIC', 'GridX', 'GridY', 'viewIC',
                         'scalefactor', 'sdB', 'sdC', 'sdG', 'sdH', 'sdO', 'sdS', 'TotDist']


# step2 : make a map for every tree : key = treename and value is a list,
# that list contains the attributes
mapAvgDist = make_map_trees_101(ls_columns_df_101comp, map_apetree)
print(mapAvgDist.values())
mapAggDist = make_agg_dist_6vector_foragroup(mapAvgDist)

idxgroupIC = ls_columns_df_101comp.index('groupIC')
idxtotdist = ls_columns_df_101comp.index('TotDist')
print('sorted list ::::' + str(idxgroupIC) + str(idxtotdist))

ls_total_records = sorted(list(mapAvgDist.values()), key=lambda x: (x[ls_columns_df_101comp.index('groupIC')], x[ls_columns_df_101comp.index('TotDist')])) + \
    list(mapAggDist.values())  # a list of 101 + 4

# sort on total distance, now update gridx and gridY
ls_update = updateGridXGridY(ls_total_records)
for i in range(0, len(mapAvgDist.values())):
    print(ls_update[i][idxgroupIC])
    print(ls_update[i][idxtotdist])
# print('lstotal' + str(ls_total_records[0]))
# print('lstotal' + str(ls_total_records[1]))
# print('lstotal' + str(ls_total_records[2]))
# print('lstotal' + str(ls_total_records[3]))
# print('lstotal' + str(len(ls_total_records)))

#
# for group in mapAggDist.values():
#     for i in range(0, len(ls_columns_df_101comp)):
#         print(ls_columns_df_101comp[i] + '==>' + str(group[i]))

write_csv_101_trees(ls_update)
