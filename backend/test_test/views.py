from .models import TodoItem
from .serializer import TodoItemSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response



@api_view(["Get"])
def get_todos(request):
    todoItems = TodoItem.objects.all()
    serializer = TodoItemSerializer(todoItems, many=True)
    return Response(serializer.data)


@api_view(["Post"])
def create_todos(request):
    serializer = TodoItemSerializer(data=request.data) #get data from request
    if serializer.is_valid():
        serializer.save() #save to database
        return Response(serializer.data, status=status.HTTP_201_CREATED) #return data as well http status
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def todo_detail(request, pk):
    try:
        todoItem = TodoItem.objects.get(pk=pk)
    except TodoItem.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TodoItemSerializer(todoItem)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = TodoItemSerializer(todoItem, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        todoItem.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)