import pandas as pd
import argparse

if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.add_argument("--file_heatmap_values", required=True, type=str)
  args = parser.parse_args()

  df = pd.read_csv(args.file_heatmap_values, header=0, index_col=[0])
  output = []
  samples = df.columns
  for sample_1 in samples:
    for sample_2 in samples:
      output.append({"sample_1":sample_1, "sample_2":sample_2, "distance":df[sample_1][sample_2]})
  
  print(output)
